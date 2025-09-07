import { logger, schedules, wait } from "@trigger.dev/sdk/v3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const goldHistoryPrice = schedules.task({
  id: "gold-date-price-history-task",
  // 每天凌晨执行
  cron: "0 0 * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    // The payload contains the last run timestamp that you can use to check if this is the first run
    // And calculate the time since the last run
    const distanceInMs =
      payload.timestamp.getTime() - (payload.lastTimestamp ?? new Date()).getTime();

    logger.log("First scheduled tasks", { payload, distanceInMs });

    const res = await fetch(
      `https://ms.jr.jd.com/gw/generic/hj/h5/m/historyPrices?reqData={"period":"y"}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          "Content-Length": "0",
          "Origin": "https://m.jr.jd.com",
          "Connection": "keep-alive",
          "Referer": "https://m.jr.jd.com/",
          "Cookie": "qd_ad=www.google.com%7C-%7Cseo%7C-%7C0; qd_uid=MF9L1NGZ-3PD3PT2B2Q7HI6LLMYMQ; qd_fs=1757242889740; qd_ls=1757242889740; qd_ts=1757244752804; qd_sq=2; __jda=168871293.1757242890142151768943.1757242890.1757242890.1757242890.1; __jdb=168871293.8.1757242890142151768943|1.1757242890; __jdc=168871293; __jdv=168871293|www.google.com|-|referral|-|1757242890142; __jdu=1757242890142151768943; 3AB9D23F7A4B3C9B=JUG7XTSOCTOC4H7QBWWQIAHR3ZLFYKL5NVSF4PHPYB43SZD455AVWCK2ALDE5R6U2UF32SSBWRI2DHS6NPXMA2YVG4; __jrr=47DE7C7D0456B35F95D0B6C1D195D0; areaId=19; ipLoc-djd=19-1607-0-0; qd_sid=MF9L1NGZ-3PD3PT2B2Q7HI6LLMYMQ-2",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
          "Priority": "u=0",
          "TE": "trailers"
        },
      }
    );

    const prices: {demode: boolean, price: string, time: string}[] = (await res.json())?.resultData?.datas;

    const newPrice = (await prisma.gold_price.findMany({
      where: {
        price_channel: 'jd',
        price_time_type: 'date'
      },
      orderBy: {
        price_time: 'desc'
      },
      take: 1
    }))[0];

    logger.log('Latest price in DB:', newPrice);

    const count = await prisma.gold_price.createMany({
      data: prices?.filter(item => newPrice?.price_time === null || parseInt(item.time) > parseInt(newPrice.price_time))
        .map((price) => ({
          price: price.price,
          price_time: price.time,
          price_time_type: 'date',
          price_channel: 'jd',
          created_time: new Date(),
          updated_time: new Date()
        })),
      skipDuplicates: true,
    })

    logger.log(`Fetched ${prices.length} prices, inserted ${count.count} new prices`);

    // Format the timestamp using the timezone from the payload
    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });

    logger.log(formatted);
  },
});

export const goldLastPrice = schedules.task({
  id: "gold-last-price-task",
  // 每分钟执行
  cron: "*/1 * * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 120, // Stop executing after 120 secs (2 mins) of compute
  run: async (payload, { ctx }) => {
    // The payload contains the last run timestamp that you can use to check if this is the first run
    // And calculate the time since the last run
    const distanceInMs =
      payload.timestamp.getTime() - (payload.lastTimestamp ?? new Date()).getTime();

    logger.log("First scheduled tasks", { payload, distanceInMs });

    const res = await fetch(
      `https://ms.jr.jd.com/gw/generic/hj/h5/m/latestPrice?reqData={}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          "Content-Length": "0",
          "Origin": "https://m.jr.jd.com",
          "Connection": "keep-alive",
          "Referer": "https://m.jr.jd.com/",
          "Cookie": "qd_ad=www.google.com%7C-%7Cseo%7C-%7C0; qd_uid=MF9L1NGZ-3PD3PT2B2Q7HI6LLMYMQ; qd_fs=1757242889740; qd_ls=1757242889740; qd_ts=1757244752804; qd_sq=2; __jda=168871293.1757242890142151768943.1757242890.1757242890.1757242890.1; __jdc=168871293; __jdv=168871293|www.google.com|-|referral|-|1757242890142; __jdu=1757242890142151768943; 3AB9D23F7A4B3C9B=JUG7XTSOCTOC4H7QBWWQIAHR3ZLFYKL5NVSF4PHPYB43SZD455AVWCK2ALDE5R6U2UF32SSBWRI2DHS6NPXMA2YVG4; __jrr=47DE7C7D0456B35F95D0B6C1D195D0; areaId=19; ipLoc-djd=19-1607-0-0",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
          "TE": "trailers"
        },
      }
    );

    const price: {price: string, productSku: string, time: string} = (await res.json())?.resultData?.datas;
    if (!price) {
      logger.log('No price data from JD');
      return;
    }
    logger.log('Latest price from JD:', price);

    const id = (await prisma.gold_price.findMany({
      where: {
        price_channel: 'jd',
        price_time: price.time,
        price_time_type: 'last'
      },
      select: {
        id: true
      }
    }))[0]?.id;

    if (id == null) {
      await prisma.gold_price.create({
        data: {
          price: price.price,
          product_sku: price.productSku,
          price_time: price.time,
          price_time_type: 'last',
          price_channel: 'jd',
          created_time: new Date(),
          updated_time: new Date()
        }
      })
      logger.log('Inserted new latest price record');
    } else {
      await prisma.gold_price.update({
        where: {
          id
        },
        data: {
          price: price.price,
          product_sku: price.productSku,
          updated_time: new Date()
        }
      })
      logger.log('Updated existing latest price record');
    }
  }
});