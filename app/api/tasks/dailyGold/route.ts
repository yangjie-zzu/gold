import { dailyGoldPriceTask } from "@/task/gold"

export async function POST() {
    await dailyGoldPriceTask.run()
    return new Response('Daily gold price task executed')
}