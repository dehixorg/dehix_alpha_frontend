'use client';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  Home,
  LineChart,
  ListFilter,
  MoreVertical,
  Package,
  Search,
  Settings,
  Truck,
  Users2,
  Activity,
  CircleDollarSign,
  FolderKanban,
  Sparkles,
  Boxes,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import CustomCard from '@/components/newcomp-test/act-proj/active-card';
import CardWithForm from '@/components/newcomp-test/pen-proj/pending-card';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '@/components/shared/breadcrumbList';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RootState } from '@/lib/store';
import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import dummyData from '@/dummydata.json';

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const menuItemsTop: MenuItem[] = [
    {
      href: '#',
      icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
      label: 'Dehix',
    },
    {
      href: '#',
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
    },
    {
      href: '#',
      icon: <Package className="h-5 w-5" />,
      label: 'Projects',
    },
    {
      href: '#',
      icon: <Users2 className="h-5 w-5" />,
      label: 'Customers',
    },
    {
      href: '#',
      icon: <LineChart className="h-5 w-5" />,
      label: 'Analytics',
    },
    {
      href: '/dashboard/talent',
      icon: <Sparkles className="h-5 w-5" />,
      label: 'Talent',
    },
  ];

  const menuItemsBottom: MenuItem[] = [
    {
      href: '/settings/personal-info',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
    },
  ];
  console.log(user);
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dashboard"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Dashboard"
          />

          <Breadcrumb
            items={[
              { label: 'Dashboard', link: '/dashboard/freelancer' },
              { label: 'Orders', link: '/dashboard/freelancer' },
              { label: 'Recent Orders', link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownProfile />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 min-w-2">
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 pt-2 pb-2 ml-1 md:gap-4">
              <div className="col-span-1 pb-1.2">
                <CustomCard
                  heading={dummyData.dashboardactiveProject.heading}
                  icon={Activity}
                  content={dummyData.dashboardactiveProject.content}
                />
              </div>
              <div className="col-span-1">
                <CardWithForm
                  title={dummyData.dashboardpendingProject.title}
                  itemCounts={dummyData.dashboardpendingProject.itemCounts}
                />
              </div>
              <div className="col-span-1">
                <CustomCard
                  heading={dummyData.dashboardtotalRevenue.heading}
                  icon={CircleDollarSign}
                  content={dummyData.dashboardtotalRevenue.content}
                />
              </div>
              <div className="col-span-1 ">
                <CustomCard
                  heading={dummyData.dashboardoracleWork.heading}
                  icon={FolderKanban}
                  content={dummyData.dashboardoracleWork.content}
                />
              </div>
            </section>

            <Tabs defaultValue="week">
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-sm"
                      >
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only">Filter</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem checked>
                        Fulfilled
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>
                        Declined
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>
                        Refunded
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-sm"
                  >
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Export</span>
                  </Button>
                </div>
              </div>
              <TabsContent value="week">
                <Card x-chunk="dashboard-05-chunk-3">
                  <CardHeader className="px-7">
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>
                      Recent orders from your store.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Type
                          </TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Status
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Date
                          </TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-accent">
                          <TableCell>
                            <div className="font-medium">
                              {dummyData.dashboardorderTable.customerName}
                            </div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {dummyData.dashboardorderTable.customerEmail}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {dummyData.dashboardorderTable.customerType}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              {dummyData.dashboardorderTable.customerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {dummyData.dashboardorderTable.customerDate}
                          </TableCell>
                          <TableCell className="text-right">
                            {dummyData.dashboardorderTable.customerAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">
                              {dummyData.dashboardorderTable.customerName}
                            </div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {dummyData.dashboardorderTable.customerEmail}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {dummyData.dashboardorderTable.customerType}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              {dummyData.dashboardorderTable.customerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {dummyData.dashboardorderTable.customerDate}
                          </TableCell>
                          <TableCell className="text-right">
                            {dummyData.dashboardorderTable.customerAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">
                              {dummyData.dashboardorderTable.customerName}
                            </div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {dummyData.dashboardorderTable.customerEmail}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {dummyData.dashboardorderTable.customerType}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              {dummyData.dashboardorderTable.customerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {dummyData.dashboardorderTable.customerDate}
                          </TableCell>
                          <TableCell className="text-right">
                            {dummyData.dashboardorderTable.customerAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">
                              {dummyData.dashboardorderTable.customerName}
                            </div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {dummyData.dashboardorderTable.customerEmail}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {dummyData.dashboardorderTable.customerType}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              {dummyData.dashboardorderTable.customerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {dummyData.dashboardorderTable.customerDate}
                          </TableCell>
                          <TableCell className="text-right">
                            {dummyData.dashboardorderTable.customerAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">
                              {dummyData.dashboardorderTable.customerName}
                            </div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {dummyData.dashboardorderTable.customerEmail}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {dummyData.dashboardorderTable.customerType}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              {dummyData.dashboardorderTable.customerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {dummyData.dashboardorderTable.customerDate}
                          </TableCell>
                          <TableCell className="text-right">
                            {dummyData.dashboardorderTable.customerAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">
                              {dummyData.dashboardorderTable.customerName}
                            </div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {dummyData.dashboardorderTable.customerEmail}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {dummyData.dashboardorderTable.customerType}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              {dummyData.dashboardorderTable.customerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {dummyData.dashboardorderTable.customerDate}
                          </TableCell>
                          <TableCell className="text-right">
                            {dummyData.dashboardorderTable.customerAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">
                              {dummyData.dashboardorderTable.customerName}
                            </div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {dummyData.dashboardorderTable.customerEmail}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {dummyData.dashboardorderTable.customerType}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              {dummyData.dashboardorderTable.customerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {dummyData.dashboardorderTable.customerDate}
                          </TableCell>
                          <TableCell className="text-right">
                            {dummyData.dashboardorderTable.customerAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">
                              {dummyData.dashboardorderTable.customerName}
                            </div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {dummyData.dashboardorderTable.customerEmail}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {dummyData.dashboardorderTable.customerType}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              {dummyData.dashboardorderTable.customerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {dummyData.dashboardorderTable.customerDate}
                          </TableCell>
                          <TableCell className="text-right">
                            {dummyData.dashboardorderTable.customerAmount}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="">
            <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
              <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                  <CardTitle className="group flex items-center gap-2 text-lg">
                    Order Oe31b70H
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">Copy Order ID</span>
                    </Button>
                  </CardTitle>
                  dashboard
                  <CardDescription>
                    {dummyData.dashboardorderDate}
                  </CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <Truck className="h-3.5 w-3.5" />
                    <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                      Track Order
                    </span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline" className="h-8 w-8">
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Trash</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                  <div className="font-semibold">Order Details</div>
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Glimmer Lamps x <span>2</span>
                      </span>
                      <span>$250.00</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Aqua Filters x <span>1</span>
                      </span>
                      <span>$49.00</span>
                    </li>
                  </ul>
                  <Separator className="my-2" />
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>$299.00</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>$5.00</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>$25.00</span>
                    </li>
                    <li className="flex items-center justify-between font-semibold">
                      <span className="text-muted-foreground">Total</span>
                      <span>$329.00</span>
                    </li>
                  </ul>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <div className="font-semibold">Shipping Information</div>
                    <address className="grid gap-0.5 not-italic text-muted-foreground">
                      <span>
                        {dummyData.dashboardorderShippingAddress.name}
                      </span>
                      <span>
                        {dummyData.dashboardorderShippingAddress.address}
                      </span>
                      <span>
                        {dummyData.dashboardorderShippingAddress.state}
                      </span>
                    </address>
                  </div>
                  <div className="grid auto-rows-max gap-3">
                    <div className="font-semibold">Billing Information</div>
                    <div className="text-muted-foreground">
                      Same as shipping address
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3">
                  <div className="font-semibold">Customer Information</div>
                  <dl className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Customer</dt>
                      <dd>{dummyData.dashboardorderCustomerInfo.customer}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd>
                        <a href="mailto:">
                          {dummyData.dashboardorderCustomerInfo.email}
                        </a>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Phone</dt>
                      <dd>
                        <a href="tel:">
                          {dummyData.dashboardorderCustomerInfo.phone}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3">
                  <div className="font-semibold">Payment Information</div>
                  <dl className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1 text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        {dummyData.dashboardorderCard.card}
                      </dt>
                      <dd>{dummyData.dashboardorderCard.cardNumber}</dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
              <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                <div className="text-xs text-muted-foreground">
                  Updated{' '}
                  <time dateTime="2023-11-23">
                    {dummyData.dashboardorderUpdateDate}
                  </time>
                </div>
                <Pagination className="ml-auto mr-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <Button size="icon" variant="outline" className="h-6 w-6">
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span className="sr-only">Previous Order</span>
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <Button size="icon" variant="outline" className="h-6 w-6">
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="sr-only">Next Order</span>
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
