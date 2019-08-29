const { Command } = require('discord-akairo');
const Canvas = require('canvas');
const { join } = require('path');

class BullyCommand extends Command {
  constructor() {
    super('bully', {
      aliases: ['bully', 'bulli'],
      category: 'general',
      ownerOnly: false,
      channel: ['guild', 'dm'],
      description: {
        content: 'Bullies someone.',
        usage: '<mention | username | id> *[1|2]',
        examples: ['@ someone', '462219867467022347']
      },
      args: [
        {
          'id': 'user',
          'type': 'user',
          'default': message => message.author
        },
        {
          'id': 'lvl',
          'type': 'number',
          'default': 1
        }
      ],
      clientPermissions: ['ATTACH_FILES']
    });
  }

  async exec(message, { user, lvl }) {
    if (user.id === message.client.user.id) {
      return message.channel.send(`Can't bully me!`, {
        files: [join(__dirname, '../..', 'static/me.gif')]
      });
    }

    if (user.id === this.client.config.ownerID) {
      return message.util.send(`Can't bully The Creator!`, {
        files: [join(__dirname, '../..', 'static/me.gif')]
      });
    }

    let canvas;
    let ctx;
    let base;
    let avatar;
    let fontSize = 70;
    const fontColor = '#000';
    let textWidth;

    switch (lvl) {
    case 1:
    default:
      canvas = Canvas.createCanvas(1068, 821);
      ctx = canvas.getContext('2d');
      join(__dirname, '..', 'inhibitors');
      base = await Canvas.loadImage(join(__dirname, '../..', 'static/original.jpg'));
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.arc(690, 210, 60, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      avatar = await Canvas.loadImage(user.avatarURL({ format: 'jpg' }));
      ctx.drawImage(avatar, 630, 150, 125, 125);
      break;
    case 2:
      canvas = Canvas.createCanvas(1100, 1095);
      ctx = canvas.getContext('2d');
      base = await Canvas.loadImage(join(__dirname, '../..', 'static/milions.jpg'));
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = fontColor;
      ctx.fillText('milions rejoice as', canvas.width / 30, canvas.height / 18);

      do {
        ctx.font = `${fontSize -= 10}px sans-serif`;
      } while (ctx.measureText(user.username).width > canvas.width - 300);
      textWidth = ctx.measureText(user.username).width;
      ctx.fillStyle = this.client.config.color;
      ctx.fillText(user.username, canvas.width / 2 - textWidth / 2, canvas.height / 7.5);

      ctx.fillStyle = fontColor;
      ctx.font = '70px sans-serif';
      ctx.fillText('is executed', canvas.width / 1.5, canvas.height / 5);

      ctx.beginPath();
      ctx.arc(567, 435, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      avatar = await Canvas.loadImage(user.avatarURL({ format: 'jpg' }));
      ctx.drawImage(avatar, 517, 385, 100, 100);
    }

    const attachment = this.client.util.attachment(canvas.toBuffer());

    return message.util.send(attachment);
  }
}

module.exports = BullyCommand;