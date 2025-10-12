import { lastGoldPriceTask } from "@/task/gold"

export async function GET() {
    await lastGoldPriceTask.run()
    return new Response('Last gold price task executed')
}