import nodeCron from "node-cron";
import { Task } from "./types";

export const startTask = (task: Task) => {
    nodeCron.schedule(task.cron, async () => {
        try {
            await task.run();
        } catch (error) {
            console.error("Error executing task:", error);
        }
    });
}

export const createTask = (task: Task) => {
    return task;
}