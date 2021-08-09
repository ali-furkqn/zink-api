import { PoolModule } from "./pool/pool.module";
import { Module } from "./common/decorators";

@Module({
    imports: [PoolModule],
})
export class AppModule {}
