import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { prisma } from "@pos/db";
import { CreateProductSchema } from "@pos/shared";

@Controller("products")
export class ProductsController {
  @Get()
  async list(@Query("q") q?: string) {
    return prisma.product.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { sku: { contains: q } },
              { barcode: { equals: q } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
    });
  }

  @Get("by-barcode")
  async byBarcode(@Query("barcode") barcode: string) {
    return prisma.product.findUnique({ where: { barcode } });
  }

  @Post()
  async create(@Body() body: unknown) {
    const data = CreateProductSchema.parse(body);
    return prisma.product.create({ data });
  }
}
