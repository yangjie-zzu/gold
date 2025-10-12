import { startTask } from "@/task";
import { dailyGoldPriceTask, lastGoldPriceTask } from "@/task/gold";

startTask(dailyGoldPriceTask);
startTask(lastGoldPriceTask);

console.log("Tasks started");

export async function GET() {
  return new Response("Tasks are running");
}