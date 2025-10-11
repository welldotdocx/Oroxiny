const { EmbedBuilder, AuditLogEvent } = require('discord.js');

class ActionLogger {
    constructor(client) {
        this.client = client;
        this.logChannelId = '1423605806044326977'; // Channel ID untuk action log
    }

    async getLogChannel(guild) {
        const channel = guild.channels.cache.get(this.logChannelId);
        if (!channel) {
            console.log(`❌ Log channel with ID ${this.logChannelId} not found in guild ${guild.name}`);
            return null;
        }
        return channel;
    }

    async getAuditLogEntry(guild, type, targetId = null, delay = 1000) {
        try {
            // Wait a bit for audit log to be available
            await new Promise(resolve => setTimeout(resolve, delay));
            
            const auditLogs = await guild.fetchAuditLogs({
                type: type,
                limit: 5
            });

            if (targetId) {
                return auditLogs.entries.find(entry => 
                    entry.target?.id === targetId || entry.targetId === targetId
                );
            }

            return auditLogs.entries.first();
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            return null;
        }
    }

    createBaseEmbed() {
        return new EmbedBuilder()
            .setColor('#2f3136')
            .setTimestamp();
    }

    async logMemberJoin(member) {
        const channel = await this.getLogChannel(member.guild);
        if (!channel) return;

        const embed = this.createBaseEmbed()
            .setAuthor({
                name: 'Member Joined',
                iconURL: member.user.displayAvatarURL()
            })
            .setDescription(`**${member.user.tag}** joined the server`)
            .addFields(
                { name: 'User', value: `${member.user} (${member.user.tag})`, inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Member Count', value: member.guild.memberCount.toString(), inline: true }
            )
            .setFooter({ text: `ID: ${member.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` });

        await channel.send({ embeds: [embed] });
    }

    async logMemberLeave(member) {
        const channel = await this.getLogChannel(member.guild);
        if (!channel) return;

        const embed = this.createBaseEmbed()
            .setAuthor({
                name: 'Member Left',
                iconURL: member.user.displayAvatarURL()
            })
            .setDescription(`**${member.user.tag}** left the server`)
            .addFields(
                { name: 'User', value: `${member.user} (${member.user.tag})`, inline: true },
                { name: 'Joined', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
                { name: 'Member Count', value: member.guild.memberCount.toString(), inline: true }
            )
            .setFooter({ text: `ID: ${member.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` });

        await channel.send({ embeds: [embed] });
    }

    async logMemberUpdate(oldMember, newMember) {
        const channel = await this.getLogChannel(newMember.guild);
        if (!channel) return;

        // Check for nickname changes
        if (oldMember.nickname !== newMember.nickname) {
            const auditEntry = await this.getAuditLogEntry(newMember.guild, AuditLogEvent.MemberUpdate, newMember.id);
            const executor = auditEntry?.executor || newMember.user;

            const embed = this.createBaseEmbed()
                .setAuthor({
                    name: 'Member Updated',
                    iconURL: newMember.user.displayAvatarURL()
                })
                .setDescription(`**${newMember.user.tag}**'s nickname was changed`)
                .addFields(
                    { name: 'User', value: `${newMember.user}`, inline: true },
                    { name: 'Old Nickname', value: oldMember.nickname || 'None', inline: true },
                    { name: 'New Nickname', value: newMember.nickname || 'None', inline: true },
                    { name: 'Changed By', value: `${executor}`, inline: true }
                )
                .setFooter({ text: `ID: ${newMember.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` });

            await channel.send({ embeds: [embed] });
        }

        // Check for role changes
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        if (addedRoles.size > 0) {
            const auditEntry = await this.getAuditLogEntry(newMember.guild, AuditLogEvent.MemberRoleUpdate, newMember.id);
            const executor = auditEntry?.executor || newMember.guild.members.me.user;

            const embed = this.createBaseEmbed()
                .setAuthor({
                    name: 'Member Role Added',
                    iconURL: newMember.user.displayAvatarURL()
                })
                .setDescription(`**${newMember.user.tag}** was given role(s)`)
                .addFields(
                    { name: 'User', value: `${newMember.user}`, inline: true },
                    { name: 'Role(s) Added', value: addedRoles.map(role => `<@&${role.id}>`).join(', '), inline: true },
                    { name: 'Given By', value: `${executor}`, inline: true }
                )
                .setFooter({ text: `ID: ${newMember.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` });

            await channel.send({ embeds: [embed] });
        }

        if (removedRoles.size > 0) {
            const auditEntry = await this.getAuditLogEntry(newMember.guild, AuditLogEvent.MemberRoleUpdate, newMember.id);
            const executor = auditEntry?.executor || newMember.guild.members.me.user;

            const embed = this.createBaseEmbed()
                .setAuthor({
                    name: 'Member Role Removed',
                    iconURL: newMember.user.displayAvatarURL()
                })
                .setDescription(`**${newMember.user.tag}** was removed from role(s)`)
                .addFields(
                    { name: 'User', value: `${newMember.user}`, inline: true },
                    { name: 'Role(s) Removed', value: removedRoles.map(role => `<@&${role.id}>`).join(', '), inline: true },
                    { name: 'Removed By', value: `${executor}`, inline: true }
                )
                .setFooter({ text: `ID: ${newMember.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` });

            await channel.send({ embeds: [embed] });
        }
    }

    async logChannelCreate(channel) {
        const logChannel = await this.getLogChannel(channel.guild);
        if (!logChannel) return;

        const auditEntry = await this.getAuditLogEntry(channel.guild, AuditLogEvent.ChannelCreate, channel.id);
        const executor = auditEntry?.executor;

        const embed = this.createBaseEmbed()
            .setAuthor({
                name: 'Channel Created',
                iconURL: channel.guild.iconURL()
            })
            .setDescription(`Channel **${channel.name}** was created`)
            .addFields(
                { name: 'Channel', value: `${channel}`, inline: true },
                { name: 'Type', value: channel.type.toString(), inline: true },
                { name: 'Category', value: channel.parent?.name || 'None', inline: true }
            )
            .setFooter({ text: `ID: ${channel.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` });

        if (executor) {
            embed.addFields({ name: 'Created By', value: `${executor}`, inline: true });
        }

        await logChannel.send({ embeds: [embed] });
    }

    async logChannelDelete(channel) {
        const logChannel = await this.getLogChannel(channel.guild);
        if (!logChannel) return;

        const auditEntry = await this.getAuditLogEntry(channel.guild, AuditLogEvent.ChannelDelete, channel.id);
        const executor = auditEntry?.executor;

        const embed = this.createBaseEmbed()
            .setAuthor({
                name: 'Channel Deleted',
                iconURL: channel.guild.iconURL()
            })
            .setDescription(`Channel **${channel.name}** was deleted`)
            .addFields(
                { name: 'Channel Name', value: channel.name, inline: true },
                { name: 'Type', value: channel.type.toString(), inline: true },
                { name: 'Category', value: channel.parent?.name || 'None', inline: true }
            )
            .setFooter({ text: `ID: ${channel.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` });

        if (executor) {
            embed.addFields({ name: 'Deleted By', value: `${executor}`, inline: true });
        }

        await logChannel.send({ embeds: [embed] });
    }

    async logChannelUpdate(oldChannel, newChannel) {
        const logChannel = await this.getLogChannel(newChannel.guild);
        if (!logChannel) return;

        const changes = [];

        if (oldChannel.name !== newChannel.name) {
            changes.push(`**Name:** ${oldChannel.name} → ${newChannel.name}`);
        }

        if (oldChannel.topic !== newChannel.topic) {
            changes.push(`**Topic:** ${oldChannel.topic || 'None'} → ${newChannel.topic || 'None'}`);
        }

        if (oldChannel.parent !== newChannel.parent) {
            changes.push(`**Category:** ${oldChannel.parent?.name || 'None'} → ${newChannel.parent?.name || 'None'}`);
        }

        if (changes.length === 0) return;

        const auditEntry = await this.getAuditLogEntry(newChannel.guild, AuditLogEvent.ChannelUpdate, newChannel.id);
        const executor = auditEntry?.executor;

        const embed = this.createBaseEmbed()
            .setAuthor({
                name: 'Channel Updated',
                iconURL: newChannel.guild.iconURL()
            })
            .setDescription(`Channel ${newChannel} was updated`)
            .addFields(
                { name: 'Changes', value: changes.join('\n'), inline: false }
            )
            .setFooter({ text: `ID: ${newChannel.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` });

        if (executor) {
            embed.addFields({ name: 'Updated By', value: `${executor}`, inline: true });
        }

        await logChannel.send({ embeds: [embed] });
    }

    async logMessageDelete(message) {
        if (message.author?.bot) return; // Ignore bot messages
        
        const logChannel = await this.getLogChannel(message.guild);
        if (!logChannel) return;

        const auditEntry = await this.getAuditLogEntry(message.guild, AuditLogEvent.MessageDelete, message.author?.id);
        const executor = auditEntry?.executor;

        const embed = this.createBaseEmbed()
            .setAuthor({
                name: 'Message Deleted',
                iconURL: message.author?.displayAvatarURL()
            })
            .setDescription(`Message by **${message.author?.tag || 'Unknown User'}** was deleted in ${message.channel}`)
            .addFields(
                { name: 'Content', value: message.content || '*No content*', inline: false },
                { name: 'Channel', value: `${message.channel}`, inline: true },
                { name: 'Author', value: message.author ? `${message.author}` : 'Unknown', inline: true }
            )
            .setFooter({ text: `ID: ${message.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` });

        if (executor && executor.id !== message.author?.id) {
            embed.addFields({ name: 'Deleted By', value: `${executor}`, inline: true });
        }

        await logChannel.send({ embeds: [embed] });
    }

    async logBanAdd(ban) {
        const logChannel = await this.getLogChannel(ban.guild);
        if (!logChannel) return;

        const auditEntry = await this.getAuditLogEntry(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id);
        const executor = auditEntry?.executor;
        const reason = auditEntry?.reason || 'No reason provided';

        const embed = this.createBaseEmbed()
            .setAuthor({
                name: 'Member Banned',
                iconURL: ban.user.displayAvatarURL()
            })
            .setDescription(`**${ban.user.tag}** was banned from the server`)
            .addFields(
                { name: 'User', value: `${ban.user}`, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setFooter({ text: `ID: ${ban.user.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` });

        if (executor) {
            embed.addFields({ name: 'Banned By', value: `${executor}`, inline: true });
        }

        await logChannel.send({ embeds: [embed] });
    }

    async logBanRemove(ban) {
        const logChannel = await this.getLogChannel(ban.guild);
        if (!logChannel) return;

        const auditEntry = await this.getAuditLogEntry(ban.guild, AuditLogEvent.MemberBanRemove, ban.user.id);
        const executor = auditEntry?.executor;

        const embed = this.createBaseEmbed()
            .setAuthor({
                name: 'Member Unbanned',
                iconURL: ban.user.displayAvatarURL()
            })
            .setDescription(`**${ban.user.tag}** was unbanned from the server`)
            .addFields(
                { name: 'User', value: `${ban.user}`, inline: true }
            )
            .setFooter({ text: `ID: ${ban.user.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` });

        if (executor) {
            embed.addFields({ name: 'Unbanned By', value: `${executor}`, inline: true });
        }

        await logChannel.send({ embeds: [embed] });
    }
}

module.exports = ActionLogger;