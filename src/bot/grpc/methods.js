module.exports = client => ({
  fetchGuilds: (call, callback) => {
    callback(null, { guilds: [...client.guilds.values()].map(g => ({ id: g.id, name: g.name })) });
  },
  fetchGuild: async (call, callback) => {
    const guild = await client.guilds.get(call.request.id).fetch();
    const cpy = JSON.parse(JSON.stringify(guild));
    cpy.createdAt = guild.createdAt;
    cpy.roles = [...guild.roles.values()];
    cpy.members = [...guild.members.values()];
    cpy.members.forEach((member, i) => {
      member.joinedAt = [...guild.members.values()][i].joinedAt;
    });
    cpy.channels = [...guild.channels.values()];
    cpy.channels.forEach((channels, i) => {
      channels.parentID = [...guild.channels.values()][i].parentID;
    });
    callback(null, cpy);
  },
  say: (call, callback) => {
    client.commandHandler.runCommand(null, client.commandHandler.findCommand('say'), call.request);
    callback(null, null);
  }
});
