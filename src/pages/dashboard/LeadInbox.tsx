import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Search,
  MoreHorizontal,
  ArrowUpDown,
  Filter,
  Download,
  Trash2,
  Mail,
  Phone,
  BarChart3,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { LeadCaptureModal } from '@/components/LeadCaptureModal'; // Reuse if needed or just detail sheet
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DashboardCreateLeadModal } from '@/components/dashboard/DashboardCreateLeadModal';
import { PlanGate } from '@/components/subscription/PlanGate';
import { useSubscription } from '@/hooks/useSubscription';

// --- Types ---
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string | null;
  estimated_value: number | null;
  probability: 'High' | 'Medium' | 'Low' | null;
  tags: string[];
  last_action_at: string;
  created_at: string;
  message: string | null;
  business_listings?: {
    business_name: string;
    city: string | null;
    state: string | null;
  };
}

// --- Constants ---
const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  new_inquiry: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  response_sent: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  qualified: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
  verified: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
  converted: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  booked: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20',
  closed: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
  completed: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
  lost: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  did_not_book: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    new: 'New',
    new_inquiry: 'New Inquiry',
    contacted: 'Contacted',
    response_sent: 'Response Sent',
    qualified: 'Qualified',
    verified: 'Verified',
    converted: 'Converted',
    booked: 'Booked',
    closed: 'Closed',
    completed: 'Completed',
    lost: 'Lost',
    did_not_book: 'Did Not Book',
  };
  return labels[status] || status.replace(/_/g, ' ');
};

const probabilityColors = {
  High: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-red-100 text-red-700',
};

export default function LeadInbox() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { plan } = useSubscription();
  const [data, setData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // Sheet State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    fetchLeads();
    // Realtime subscription could be added here
  }, [user]);

  const fetchLeads = async () => {
    if (!user) return;
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          *,
          business_listings (
            business_name,
            city,
            state
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({ title: 'Error', description: 'Failed to load leads', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const total = data.length;
    const newLeads = data.filter(l => l.status === 'new' || l.status === 'new_inquiry').length;
    const closed = data.filter(l => ['converted', 'booked', 'closed', 'completed'].includes(l.status)).length;
    const lost = data.filter(l => ['lost', 'did_not_book'].includes(l.status)).length;
    const totalValue = data.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);
    return { total, newLeads, closed, lost, totalValue };
  }, [data]);

  // --- Columns Definition ---
  const columns: ColumnDef<Lead>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Lead',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      id: 'source',
      header: 'Source',
      accessorFn: (row) => row.business_listings?.business_name, // Group by Business mostly? Or UTM source?
      cell: ({ row }) => {
        // "Headquarters" view wants to know WHERE it came from.
        // If we have UTM source use that, else show Listing Name.
        const sourceLabel = row.original.source || 'Organic'; // or row.original.utm_source
        const listingName = row.original.business_listings?.business_name;

        return (
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit mb-1">{sourceLabel}</Badge>
            {listingName && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{listingName}</span>}
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status || 'new';
        return (
          <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} border-0 whitespace-nowrap`}>
            {getStatusLabel(status).toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'estimated_value',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const val = row.original.estimated_value;
        return val ? <div className="font-medium">${val.toLocaleString()}</div> : <span className="text-muted-foreground">-</span>;
      },
    },
    {
      accessorKey: 'probability',
      header: 'Probability',
      cell: ({ row }) => {
        const prob = row.original.probability; // High, Medium, Low
        if (!prob) return <span className="text-muted-foreground text-xs">-</span>;
        return (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${probabilityColors[prob] || 'bg-gray-100'}`}>
            {prob.toUpperCase()}
          </span>
        );
      }
    },
    {
      accessorKey: 'last_action_at',
      header: 'Last Action',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {format(new Date(row.original.last_action_at || row.original.created_at), 'MMM d, yyyy')}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => { setSelectedLead(lead); setSheetOpen(true); }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.open(`mailto:${lead.email}`)}>
                Send Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Total Leads</p>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">New Leads</p>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{stats.newLeads}</div>
            <span className="text-xs text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+12%</span>
          </div>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Closed</p>
          <div className="text-2xl font-bold">{stats.closed}</div>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Pipeline Value</p>
          <div className="text-2xl font-bold text-green-600">${stats.totalValue.toLocaleString()}</div>
        </Card>
      </div>

      <PlanGate minPlan="Pro" feature="Unlimited Leads" fallback="inline">
        {plan === 'Free' && stats.total >= 10 && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-full">
                <Clock className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-500">LEAD LIMIT REACHED</p>
                <p className="text-xs text-muted-foreground">You are at {stats.total}/10 leads. Upgrade to Pro for unlimited leads and advanced tracking.</p>
              </div>
            </div>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" asChild>
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
          </div>
        )}
      </PlanGate>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            + New Lead
          </Button>
        </div>
      </div>

      <DashboardCreateLeadModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          fetchLeads();
        }}
      />

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => { setSelectedLead(row.original); setSheetOpen(true); }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Details Sheet Reuse/Integration */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Lead Details</SheetTitle>
            <SheetDescription>View and manage lead information.</SheetDescription>
          </SheetHeader>
          {selectedLead && (
            <div className="mt-6 space-y-6">
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => window.open(`mailto:${selectedLead.email}`)}>
                  <Mail className="mr-2 h-4 w-4" /> Email
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => window.open(`tel:${selectedLead.phone}`)}>
                  <Phone className="mr-2 h-4 w-4" /> Call
                </Button>
              </div>

              {/* Status Board */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Status</span>
                  <Badge className={statusColors[selectedLead.status]}>{getStatusLabel(selectedLead.status).toUpperCase()}</Badge>
                </div>
                {/* Update Status Logic Here */}
              </div>

              {/* Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Listing</label>
                    <p className="font-medium">{selectedLead.business_listings?.business_name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedLead.business_listings?.city}, {selectedLead.business_listings?.state}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Estimated Value</label>
                    <p className="font-medium text-green-600">${selectedLead.estimated_value?.toLocaleString() || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Message</label>
                  <p className="text-sm mt-1 bg-background p-3 rounded border whitespace-pre-wrap">
                    {/* Fetch 'message' from DB (not in interface yet? Wait, let's add it) */}
                    {/* Actually I didn't include 'message' in the Lead interface above, I should add it */}
                    {selectedLead.message || 'No message provided'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
