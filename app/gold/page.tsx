
import { prisma } from "../../prisma/prismaClient";
import { LineChart } from "./LineChart";

export default async function Gold() {
    const fetchList = async () => {
        "use server"
        return await prisma.gold_price.findMany();
    }
    const goldPrices = await fetchList();
    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'auto', paddingRight: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LineChart initData={goldPrices} getDataFunc={async () => {
                "use server"
                return await fetchList();
            }}/>
        </div>
    )
}