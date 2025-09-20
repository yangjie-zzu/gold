
import { prisma } from "@/prisma/prismaClient";
import { LineChart } from "./LineChart";

export default async function Gold() {
    const goldPrices = await prisma.gold_price.findMany();
    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'auto', paddingRight: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LineChart data={goldPrices} />
        </div>
    )
}