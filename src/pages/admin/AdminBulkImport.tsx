import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  FileJson,
  RefreshCw
} from 'lucide-react';

interface ParsedRow {
  business_name: string;
  category: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  hours_json?: string;
  services_json?: string;
}

interface ValidationResult {
  row: number;
  data: ParsedRow;
  isValid: boolean;
  errors: string[];
}

interface ImportResult {
  successful: number;
  failed: number;
  errors: Array<{ row: number; error: string; data?: ParsedRow }>;
}

export default function AdminBulkImport() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('csv');
  const [file, setFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [skipLogos, setSkipLogos] = useState(false);
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update'>('skip');
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  const downloadTemplate = () => {
    const headers = [
      'business_name',
      'category',
      'description',
      'address',
      'city',
      'state',
      'zip',
      'phone',
      'email',
      'website',
      'logo_url',
      'hours_json',
      'services_json'
    ];
    
    const exampleRow = [
      'Acme RV Rentals',
      'RV Rental',
      'Premium RV rentals for your next adventure',
      '123 Main Street',
      'Austin',
      'TX',
      '78701',
      '(512) 555-0123',
      'info@acmervrentals.com',
      'https://acmervrentals.com',
      'https://example.com/logo.png',
      '{"monday":{"open":"09:00","close":"17:00"},"tuesday":{"open":"09:00","close":"17:00"}}',
      '[{"name":"Class A Motorhome","price":250,"unit":"per day"},{"name":"Travel Trailer","price":150,"unit":"per day"}]'
    ];

    const csvContent = [headers.join(','), exampleRow.map(v => `"${v}"`).join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (content: string): ParsedRow[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rows.push({
        business_name: row.business_name || '',
        category: row.category || '',
        description: row.description || '',
        address: row.address || '',
        city: row.city || '',
        state: row.state || '',
        zip: row.zip || '',
        phone: row.phone || '',
        email: row.email || '',
        website: row.website || '',
        logo_url: row.logo_url || '',
        hours_json: row.hours_json || '',
        services_json: row.services_json || ''
      });
    }

    return rows;
  };

  const validateRow = (row: ParsedRow, index: number): ValidationResult => {
    const errors: string[] = [];

    // Required fields
    if (!row.business_name?.trim()) errors.push('Missing business_name');
    if (!row.category?.trim()) errors.push('Missing category');
    if (!row.address?.trim()) errors.push('Missing address');
    if (!row.city?.trim()) errors.push('Missing city');
    if (!row.state?.trim()) errors.push('Missing state');
    if (!row.zip?.trim()) errors.push('Missing zip');

    // Email validation
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push('Invalid email format');
    }

    // URL validation
    if (row.website && !row.website.startsWith('http')) {
      errors.push('Website must start with http:// or https://');
    }

    // JSON validation
    if (row.hours_json) {
      try {
        JSON.parse(row.hours_json);
      } catch {
        errors.push('Invalid hours_json format');
      }
    }

    if (row.services_json) {
      try {
        JSON.parse(row.services_json);
      } catch {
        errors.push('Invalid services_json format');
      }
    }

    return {
      row: index + 1,
      data: row,
      isValid: errors.length === 0,
      errors
    };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationResults([]);
    setImportResult(null);
    setIsValidating(true);

    try {
      const content = await selectedFile.text();
      const rows = parseCSV(content);
      const results = rows.map((row, index) => validateRow(row, index));
      setValidationResults(results);
    } catch (error) {
      toast({
        title: "Error parsing file",
        description: "Please ensure the file is a valid CSV",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleJsonValidate = () => {
    setValidationResults([]);
    setImportResult(null);
    setIsValidating(true);

    try {
      const data = JSON.parse(jsonInput);
      const rows = Array.isArray(data) ? data : [data];
      const results = rows.map((row, index) => validateRow(row as ParsedRow, index));
      setValidationResults(results);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please enter valid JSON data",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const processImport = async () => {
    const validRows = validationResults.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast({
        title: "No valid rows",
        description: "Please fix validation errors before importing",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < validRows.length; i += batchSize) {
      batches.push(validRows.slice(i, i + batchSize));
    }

    setTotalBatches(batches.length);
    
    const result: ImportResult = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      setCurrentBatch(batchIndex + 1);
      const batch = batches[batchIndex];

      try {
        const { data, error } = await supabase.functions.invoke('admin-bulk-import', {
          body: {
            rows: batch.map(r => r.data),
            skipLogos,
            duplicateHandling
          }
        });

        if (error) throw error;

        result.successful += data.results.successful;
        result.failed += data.results.failed;
        if (data.results.errors) {
          result.errors.push(...data.results.errors.map((e: any) => ({
            row: batch[e.row - 1]?.row || e.row,
            error: e.error,
            data: batch[e.row - 1]?.data
          })));
        }
      } catch (error) {
        console.error('Batch error:', error);
        result.failed += batch.length;
        batch.forEach((r) => {
          result.errors.push({
            row: r.row,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: r.data
          });
        });
      }

      setImportProgress(((batchIndex + 1) / batches.length) * 100);
      
      // Rate limiting between batches
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setImportResult(result);
    setIsImporting(false);

    toast({
      title: "Import Complete",
      description: `${result.successful} imported, ${result.failed} failed`,
      variant: result.failed > 0 ? "destructive" : "default"
    });
  };

  const downloadErrorLog = () => {
    if (!importResult?.errors.length) return;

    const headers = ['Row', 'Error', 'Business Name', 'Category', 'Address'];
    const rows = importResult.errors.map(e => [
      e.row.toString(),
      e.error,
      e.data?.business_name || '',
      e.data?.category || '',
      e.data?.address || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import_errors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = validationResults.filter(r => r.isValid).length;
  const invalidCount = validationResults.filter(r => !r.isValid).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bulk Import</h1>
        <p className="text-muted-foreground mt-1">
          Import business listings from CSV or JSON data
        </p>
      </div>

      {/* Import Options */}
      <Card>
        <CardHeader>
          <CardTitle>Import Options</CardTitle>
          <CardDescription>Configure how the import should be processed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="skipLogos" 
              checked={skipLogos}
              onCheckedChange={(checked) => setSkipLogos(checked as boolean)}
            />
            <Label htmlFor="skipLogos">Skip logo import (faster processing)</Label>
          </div>

          <div className="flex items-center gap-4">
            <Label>Duplicate Handling:</Label>
            <Select value={duplicateHandling} onValueChange={(v) => setDuplicateHandling(v as 'skip' | 'update')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip">Skip duplicates</SelectItem>
                <SelectItem value="update">Update existing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Import Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>Upload a CSV file or paste JSON data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="csv" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CSV Upload
              </TabsTrigger>
              <TabsTrigger value="json" className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                JSON Paste
              </TabsTrigger>
            </TabsList>

            <TabsContent value="csv" className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <Label 
                  htmlFor="csv-upload" 
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {file ? file.name : 'Click to upload CSV'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    or drag and drop
                  </span>
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="json" className="space-y-4">
              <Textarea
                placeholder='[{"business_name": "Example Business", "category": "RV Rental", "address": "123 Main St", "city": "Austin", "state": "TX", "zip": "78701"}]'
                className="min-h-[200px] font-mono text-sm"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <Button onClick={handleJsonValidate} disabled={!jsonInput.trim()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Validate JSON
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {isValidating && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Validating data...</p>
          </CardContent>
        </Card>
      )}

      {validationResults.length > 0 && !isValidating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Validation Results</span>
              <div className="flex gap-2">
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {validCount} Valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    {invalidCount} Invalid
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Row</TableHead>
                    <TableHead className="w-[60px]">Status</TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationResults.map((result) => (
                    <TableRow key={result.row} className={!result.isValid ? 'bg-destructive/10' : ''}>
                      <TableCell>{result.row}</TableCell>
                      <TableCell>
                        {result.isValid ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{result.data.business_name}</TableCell>
                      <TableCell>{result.data.category}</TableCell>
                      <TableCell>{result.data.city}, {result.data.state}</TableCell>
                      <TableCell>
                        {result.errors.length > 0 && (
                          <span className="text-sm text-destructive">
                            {result.errors.join(', ')}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="mt-4 flex justify-end">
              <Button 
                onClick={processImport} 
                disabled={validCount === 0 || isImporting}
                size="lg"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import {validCount} Listings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {isImporting && (
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={importProgress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing batch {currentBatch} of {totalBatches}</span>
              <span>{Math.round(importProgress)}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && !isImporting && (
        <Card>
          <CardHeader>
            <CardTitle>Import Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                <p className="text-2xl font-bold mt-2">{importResult.successful}</p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg text-center">
                <XCircle className="h-8 w-8 text-destructive mx-auto" />
                <p className="text-2xl font-bold mt-2">{importResult.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-2xl font-bold mt-2">
                  {importResult.successful + importResult.failed}
                </p>
                <p className="text-sm text-muted-foreground">Total Processed</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Error Log ({importResult.errors.length} errors)</h4>
                  <Button variant="outline" size="sm" onClick={downloadErrorLog}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Error Log
                  </Button>
                </div>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {importResult.errors.slice(0, 20).map((error, index) => (
                      <div key={index} className="p-2 bg-destructive/10 rounded text-sm">
                        <span className="font-medium">Row {error.row}:</span> {error.error}
                        {error.data?.business_name && (
                          <span className="text-muted-foreground"> - {error.data.business_name}</span>
                        )}
                      </div>
                    ))}
                    {importResult.errors.length > 20 && (
                      <p className="text-muted-foreground text-sm text-center">
                        ...and {importResult.errors.length - 20} more errors. Download the error log to see all.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="pt-4 border-t flex gap-2">
              <Button variant="outline" onClick={() => {
                setValidationResults([]);
                setImportResult(null);
                setFile(null);
                setJsonInput('');
              }}>
                Start New Import
              </Button>
              <Button asChild>
                <a href="/admin/listings">View All Listings</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
