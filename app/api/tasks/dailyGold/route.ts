import { dailyGoldPriceTask } from "@/task/gold"

export async function GET() {
    await dailyGoldPriceTask.run()
    return new Response('Daily gold price task executed')
}