export type Task = {
    cron: string;
    run: () => Promise<void>;
}