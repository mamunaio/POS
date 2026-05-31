import { Module } from "@nestjs/common";
import { ProductsController } from "./products/products.controller.js";
import { SalesController } from "./sales/sales.controller.js";
import { SyncController } from "./sync/sync.controller.js";

@Module({
  controllers: [ProductsController, SalesController, SyncController],
})
export class AppModule {}
