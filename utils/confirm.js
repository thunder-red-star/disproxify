const {
  Embed,
  ButtonComponent,
  ActionRow,
} = require("@discordjs/builders");

const {
  Embed
} = require("@discordjs/builders");

module.exports = async function confirmEmbed(
  interaction,
  title,
  awaitDesc,
  successDesc,
  failDesc
) {
  return new Promise(async (resolve, reject) => {
    let buttonList = [
      new ButtonComponent()
        .setCustomId("yes")
        .setStyle("SUCCESS")
        .setLabel("Yes"),
      new ButtonComponent().setCustomId("no").setStyle("DANGER").setLabel("No"),
    ];
    let embed = new Embed()
      .setTitle(title)
      .setDescription(awaitDesc)
      .setColor(16776960);

    const row = new ActionRow().addComponents(buttonList);

    await interaction.deferReply();

    const curPage = await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

    const filter = (i) =>
      i.customId === buttonList[0].customId ||
      i.customId === buttonList[1].customId;

    const collector = await curPage.createMessageComponentCollector({
      filter,
      time: 30_000,
    });

    collector.on("collect", async (i) => {
      let newEmbed = new MessageEmbed();
      if (i.customId == "no") {
        newEmbed
          .setTitle("Canceled")
          .setDescription(failDesc)
          .setColor(16711680);
      }
      if (i.customId == "yes") {
        newEmbed
          .setTitle("Success")
          .setDescription(successDesc)
          .setColor(65280);
      }
      await i.deferUpdate();
      if (!curPage.deleted) {
        const disabledRow = new ActionRow().addComponents(
          buttonList[0].setDisabled(true),
          buttonList[1].setDisabled(true)
        );
        i.editReply({
          embeds: [newEmbed],
          components: [disabledRow],
        });
      }
      if (i.customId == "no") {
        resolve(false);
      }
      if (i.customId == "yes") {
        resolve(true);
      }
    });

    collector.on("end", async () => {
      if (!curPage.deleted) {
        const disabledRow = new ActionRow().addComponents(
          buttonList[0].setDisabled(true),
          buttonList[1].setDisabled(true)
        );
        curPage.edit({
          embeds: [embed],
          components: [disabledRow],
        });
      }
      resolve(false);
    });
    return curPage;
  });
};
