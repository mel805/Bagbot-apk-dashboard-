package com.bagbot.manager.data.models

import com.google.gson.annotations.SerializedName

// ========== Authentification ==========

data class AuthResponse(
    val token: String,
    val user: DiscordUser
)

data class DiscordUser(
    val id: String,
    val username: String,
    val discriminator: String,
    val avatar: String?
) {
    fun getAvatarUrl(): String? {
        return avatar?.let {
            "https://cdn.discordapp.com/avatars/$id/$it.png"
        }
    }
    
    fun getDisplayName(): String {
        return if (discriminator == "0") username else "$username#$discriminator"
    }
}

data class AuthUrlResponse(
    val url: String,
    val state: String
)

// ========== Statistiques du Bot ==========

data class BotStats(
    val guilds: Int,
    val users: Int,
    val channels: Int,
    val uptime: Double,
    val memory: MemoryUsage,
    val ping: Int,
    val version: String
) {
    fun getUptimeFormatted(): String {
        val days = (uptime / 86400).toInt()
        val hours = ((uptime % 86400) / 3600).toInt()
        val minutes = ((uptime % 3600) / 60).toInt()
        
        val parts = mutableListOf<String>()
        if (days > 0) parts.add("${days}j")
        if (hours > 0) parts.add("${hours}h")
        if (minutes > 0) parts.add("${minutes}m")
        
        return parts.joinToString(" ").ifEmpty { "< 1m" }
    }
}

data class MemoryUsage(
    val rss: Long,
    val heapTotal: Long,
    val heapUsed: Long,
    val external: Long
) {
    fun getHeapUsedMB(): String {
        return String.format("%.2f MB", heapUsed / 1024.0 / 1024.0)
    }
    
    fun getHeapTotalMB(): String {
        return String.format("%.2f MB", heapTotal / 1024.0 / 1024.0)
    }
}

// ========== Serveurs (Guilds) ==========

data class GuildsResponse(
    val guilds: List<Guild>
)

data class Guild(
    val id: String,
    val name: String,
    val icon: String?,
    val memberCount: Int,
    val ownerId: String
)

data class GuildDetails(
    val id: String,
    val name: String,
    val icon: String?,
    val memberCount: Int,
    val owner: GuildOwner,
    val channels: Int,
    val roles: Int,
    val createdAt: String
)

data class GuildOwner(
    val id: String,
    val username: String,
    val discriminator: String
)

// ========== Commandes ==========

data class CommandsResponse(
    val commands: List<BotCommand>
)

data class BotCommand(
    val name: String,
    val description: String,
    val options: List<CommandOption>
)

data class CommandOption(
    val name: String,
    val description: String,
    val type: Int,
    val required: Boolean? = false
)

data class CommandExecuteRequest(
    val guildId: String,
    val channelId: String,
    val commandName: String,
    val options: Map<String, Any>? = null
)

// ========== Économie ==========

data class EconomyConfig(
    val enabled: Boolean,
    val currency: String
)

data class EconomyTopResponse(
    val message: String,
    val top: List<EconomyUser>
)

data class EconomyUser(
    val userId: String,
    val username: String,
    val balance: Int,
    val rank: Int
)

// ========== Modération ==========

data class ModerationLogsResponse(
    val message: String,
    val logs: List<ModerationLog>
)

data class ModerationLog(
    val id: String,
    val type: String,
    val userId: String,
    val moderatorId: String,
    val reason: String?,
    val timestamp: Long
)

data class ModerationActionRequest(
    val userId: String,
    val reason: String?
)

// ========== Musique ==========

data class MusicStatus(
    val playing: Boolean,
    val current: CurrentTrack?,
    val queue: List<Track>,
    val volume: Int,
    val paused: Boolean
)

data class CurrentTrack(
    val title: String,
    val author: String,
    val duration: Long,
    val url: String
) {
    fun getDurationFormatted(): String {
        val minutes = duration / 60000
        val seconds = (duration % 60000) / 1000
        return String.format("%d:%02d", minutes, seconds)
    }
}

data class Track(
    val title: String,
    val author: String,
    val duration: Long
) {
    fun getDurationFormatted(): String {
        val minutes = duration / 60000
        val seconds = (duration % 60000) / 1000
        return String.format("%d:%02d", minutes, seconds)
    }
}

data class MusicControlRequest(
    val action: String // "play", "pause", "resume", "skip", "stop"
)

// ========== Réponses génériques ==========

data class SuccessResponse(
    val success: Boolean,
    val message: String?,
    val note: String? = null
)

data class ErrorResponse(
    val error: String,
    val details: String? = null
)

data class HealthResponse(
    val status: String,
    val uptime: Double,
    val timestamp: Long,
    val bot: BotHealth
)

data class BotHealth(
    val ready: Boolean,
    val guilds: Int
)
