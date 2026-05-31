import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { prisma } from "@pos/db";
import { CreateSaleSchema, computeSaleTotals } from "@pos/shared";

@Controller("sales")
export class SalesController {
  @Get()
  async list(@Query("branchId") branchId?: string) {
    return prisma.sale.findMany({
      where: branchId ? { branchId } : undefined,
      include: { items: true },
      orderBy: { soldAt: "desc" },
      take: 100,
    });
  }

  @Post()
  async create(@Body() body: unknown) {
    const input = CreateSaleSchema.parse(body);
    const totals = computeSaleTotals(input.items);

    // upsert keeps offline re-sync idempotent (same client UUID)
    return prisma.sale.upsert({
      where: { id: input.id },
      update: {},
      create: {
        id: input.id,
        branchId: input.branchId,
        paymentMethod: input.paymentMethod,
        soldAt: new Date(input.soldAt),
        subtotalMinor: totals.subtotalMinor,
        taxMinor: totals.taxMinor,
        totalMinor: totals.totalMinor,
        items: {
          create: input.items.map((it) => ({
            productId: it.productId,
            name: it.name,
            quantity: it.quantity,
            unitPriceMinor: it.unitPriceMinor,
            taxRateBps: it.taxRateBps,
          })),
        },
      },
      include: { items: true },
    });
  }
}
