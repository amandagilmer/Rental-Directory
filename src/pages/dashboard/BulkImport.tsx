import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ParsedRow {
  business_name: string;
  category: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  image_url?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function BulkImport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ successful: number; failed: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a CSV or Excel file',
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      toast({
        title: 'Invalid File',
        description: 'File must contain a header row and at least one data row',
        variant: 'destructive',
      });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows: ParsedRow[] = [];
    const errors: ValidationError[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate required fields
      if (!row.business_name || row.business_name === '') {
        errors.push({
          row: i + 1,
          field: 'business_name',
          message: 'Business name is required',
        });
      }

      if (!row.category || row.category === '') {
        errors.push({
          row: i + 1,
          field: 'category',
          message: 'Category is required',
        });
      }

      // Validate email format if provided
      if (row.email && row.email !== '' && !row.email.includes('@')) {
        errors.push({
          row: i + 1,
          field: 'email',
          message: 'Invalid email format',
        });
      }

      rows.push(row as ParsedRow);
    }

    setParsedData(rows);
    setValidationErrors(errors);

    if (errors.length === 0) {
      toast({
        title: 'File Parsed Successfully',
        description: `Found ${rows.length} valid rows ready for import`,
      });
    } else {
      toast({
        title: 'Validation Errors Found',
        description: `Found ${errors.length} errors in ${rows.length} rows`,
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!user || parsedData.length === 0) return;
    if (validationErrors.length > 0) {
      toast({
        title: 'Cannot Import',
        description: 'Please fix validation errors before importing',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      // Create import history record
      const { data: importHistory, error: historyError } = await supabase
        .from('import_history')
        .insert({
          user_id: user.id,
          file_name: file?.name || 'unknown',
          total_rows: parsedData.length,
        })
        .select()
        .single();

      if (historyError) throw historyError;

      // Call edge function to process import
      const { data, error } = await supabase.functions.invoke('process-bulk-import', {
        body: {
          rows: parsedData,
          importId: importHistory.id,
        },
      });

      if (error) throw error;

      setProgress(100);
      setImportResult({
        successful: data.results.successful,
        failed: data.results.failed,
      });

      toast({
        title: 'Import Complete!',
        description: `Successfully imported ${data.results.successful} listings`,
      });

      // Reset form
      setFile(null);
      setParsedData([]);
      setValidationErrors([]);
    } catch (error: any) {
      console.error('Error importing data:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'An error occurred during import',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `business_name,category,description,phone,email,website,address,city,state,zip,image_url
Example Business,Restaurant,A great place to eat,(555) 123-4567,contact@example.com,https://example.com,123 Main St,Springfield,IL,62701,https://example.com/image.jpg`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bulk Import</h1>
        <p className="text-muted-foreground mt-2">
          Upload a CSV or Excel file to import multiple business listings at once
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Download Template</CardTitle>
          <CardDescription>
            Start with our template to ensure your data is formatted correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Select a CSV or Excel file containing your business listings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={importing}
            />
            <label htmlFor="file-upload">
              <Button asChild variant="outline" disabled={importing}>
                <span className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </span>
              </Button>
            </label>
            {file && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Required Columns:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>business_name</li>
              <li>category</li>
            </ul>
            <p className="font-medium mt-3">Optional Columns:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>description, phone, email, website</li>
              <li>address, city, state, zip</li>
              <li>image_url</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Data</CardTitle>
            <CardDescription>
              Review your data before importing ({parsedData.length} rows)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">
                    Found {validationErrors.length} validation errors:
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-sm">
                        Row {error.row}, {error.field}: {error.message}
                      </li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li className="text-sm">
                        ...and {validationErrors.length - 5} more errors
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="max-h-[300px] overflow-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Business Name</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Phone</th>
                    <th className="p-2 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{row.business_name}</td>
                      <td className="p-2">{row.category}</td>
                      <td className="p-2">{row.phone || '-'}</td>
                      <td className="p-2">{row.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 10 && (
                <div className="p-2 text-center text-muted-foreground text-xs bg-muted">
                  Showing first 10 of {parsedData.length} rows
                </div>
              )}
            </div>

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  Importing... {progress}%
                </p>
              </div>
            )}

            {importResult && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Import completed: {importResult.successful} successful,{' '}
                  {importResult.failed} failed
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleImport}
              disabled={importing || validationErrors.length > 0}
              className="w-full"
            >
              {importing ? 'Importing...' : `Import ${parsedData.length} Listings`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}