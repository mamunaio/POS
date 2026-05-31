import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { prisma } from "@pos/db";
import { computeSaleTotals, SyncPullQuerySchema, SyncPushSchema } from "@pos/shared";

/**
 * Offline-first sync for branch devices.
 *  - POST /sync/push : device uploads sales created while offline (idempotent)
 *  - GET  /sync/pull : device downloads products changed since last sync
 */
@Controller("sync")
export class SyncController {
  @Post("push")
  async push(@Body() body: unknown) {
    const { sales } = SyncPushSchema.parse(body);

    await prisma.$transaction(
      sales.map((sale) => {
        const totals = computeSaleTotals(sale.items);
        return prisma.sale.upsert({
          where: { id: sale.id },
          update: {},
          create: {
            id: sale.id,
            branchId: sale.branchId,
            paymentMethod: sale.paymentMethod,
            soldAt: new Date(sale.soldAt),
            subtotalMinor: totals.subtotalMinor,
            taxMinor: totals.taxMinor,
            totalMinor: totals.totalMinor,
            items: {
              create: sale.items.map((it) => ({
                productId: it.productId,
                name: it.name,
                quantity: it.quantity,
                unitPriceMinor: it.unitPriceMinor,
                taxRateBps: it.taxRateBps,
              })),
            },
          },
        });
      }),
    );

    return { accepted: sales.length };
  }

  @Get("pull")
  async pull(@Query() query: Record<string, string>) {
    const { since } = SyncPullQuerySchema.parse(query);
    const products = await prisma.product.findMany({
      where: since ? { updatedAt: { gt: new Date(since) } } : undefined,
    });
    return {
      serverTime: new Date().toISOString(),
      products,
    };
  }
}
