const TelegramApi = require("node-telegram-bot-api");

const https = require("https");

const token = "5390918039:AAEUfgelKZ7FumW0xpdu1v5tVTCSz7lGjN8";

const bot = new TelegramApi(token, { polling: true });

const options = {
  hostname: "www.cbr-xml-daily.ru",
  port: 443,
  path: "/daily_json.js",
  method: "GET",
};



const bank = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "Узнать мой счёт", callback_data: "На вашем счёте 9.800 RUB" },
        { text: "Список карт", callback_data: 'Карта "Мир", Карта "Экобанк"' },
      ],
    ],
  }),
};

const notifications = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        {
          text: "Подлючить Уведомления",
          callback_data: "Уведомления подключены!",
        },
        {
          text: "Отключить Уведомления",
          callback_data: "Уведомления отключены",
        },
      ],
    ],
  }),
};

bot.setMyCommands([
  { command: "/start", description: "Начальное приветсвие" },
  { command: "/info", description: "Получить информацию о пользователе" },
  { command: "/get_info", description: "Получить информацию о вашем аккаунте" },
  { command: "/help", description: "Список всех команд" },
  {
    command: "/notifications",
    description:
      "Включить/отключить уведомления об изменение баланса карты Экобанка",
  },
  { command: "/currency", description: "Узнать актуальный курс рубля" },
]);

function doRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding("utf8");
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        resolve(JSON.parse(responseBody));
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

const start = () => {
  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://tlgrm.ru/_/stickers/34e/aac/34eaac67-a1c0-4bc3-b394-23fcc1b73be8/1.webp"
      );
      return bot.sendMessage(
        chatId,
        `Добро пожаловать в телеграм бот ЭкоБанка`
      );
    }
    if (text === "/info") {
      return bot.sendMessage(
        chatId,
        `${msg.from.first_name} ${msg.from.last_name} клиент Экобанка`
      );
    }
    if (text === "/get_info") {
      return bot.sendMessage(chatId, "Выберите что вы хотите узнать ?", bank);
    }
    if (text === "/help") {
      return bot.sendMessage(
        chatId,
        "Cписок всех команд /start, /info, /get_info, /currency . /notifications"
      );
    }
    if (text === "/notifications") {
      return bot.sendMessage(
        chatId,
        "Вы хотите подключить или отключить уведомления об изменение вашего баланса? ",
        notifications
      );
    }
    if (text === "/currency") {
      let requestPromise = new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          res.setEncoding("utf8");
          let responseBody = "";

          res.on("data", (chunk) => {
            responseBody += chunk;
          });

          res.on("end", () => {
            resolve(JSON.parse(responseBody));
          });
        });

        req.on("error", (err) => {
          reject(err);
        });
        req.end();
      });
      let reponseBody = await requestPromise;
      return bot.sendMessage(
        chatId,
        `курс доллара - ${reponseBody.Valute.USD.Value.toFixed(2)} рублей\nкурс евро - ${reponseBody.Valute.EUR.Value.toFixed(2)} рублей`
      );
    }
    return bot.sendMessage(
      chatId,
      'Извините, я вас не понимаю, ознакомьтесь со списком команд с помощб "/help"'
    );
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === bank[chatId]) {
      return await bot.sendMessage(chatId, `${bank[chatId]}`);
    }
    bot.sendMessage(chatId, `${data}`);
  });
};

start();
