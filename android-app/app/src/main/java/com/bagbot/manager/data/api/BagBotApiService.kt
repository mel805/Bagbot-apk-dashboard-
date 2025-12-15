package com.bagbot.manager.data.api

import com.bagbot.manager.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface BagBotApiService {
    
    // ========== Authentification ==========
    
    @GET("auth/discord/url")
    suspend fun getDiscordAuthUrl(): Response<AuthUrlResponse>
    
    @POST("auth/discord/callback")
    suspend fun authenticateWithDiscord(@Body request: Map<String, String>): Response<AuthResponse>
    
    @POST("auth/logout")
    suspend fun logout(): Response<SuccessResponse>
    
    // ========== Informations du Bot ==========
    
    @GET("bot/stats")
    suspend fun getBotStats(): Response<BotStats>
    
    @GET("bot/guilds")
    suspend fun getGuilds(): Response<GuildsResponse>
    
    @GET("bot/guilds/{guildId}")
    suspend fun getGuildDetails(@Path("guildId") guildId: String): Response<GuildDetails>
    
    // ========== Commandes ==========
    
    @GET("bot/commands")
    suspend fun getCommands(): Response<CommandsResponse>
    
    @POST("bot/commands/execute")
    suspend fun executeCommand(@Body request: CommandExecuteRequest): Response<SuccessResponse>
    
    // ========== Économie ==========
    
    @GET("bot/economy/{guildId}")
    suspend fun getEconomyConfig(@Path("guildId") guildId: String): Response<EconomyConfig>
    
    @GET("bot/economy/{guildId}/top")
    suspend fun getEconomyTop(@Path("guildId") guildId: String): Response<EconomyTopResponse>
    
    // ========== Modération ==========
    
    @GET("bot/moderation/{guildId}/logs")
    suspend fun getModerationLogs(@Path("guildId") guildId: String): Response<ModerationLogsResponse>
    
    @POST("bot/moderation/{guildId}/ban")
    suspend fun banUser(
        @Path("guildId") guildId: String,
        @Body request: ModerationActionRequest
    ): Response<SuccessResponse>
    
    @POST("bot/moderation/{guildId}/kick")
    suspend fun kickUser(
        @Path("guildId") guildId: String,
        @Body request: ModerationActionRequest
    ): Response<SuccessResponse>
    
    // ========== Musique ==========
    
    @GET("bot/music/{guildId}/status")
    suspend fun getMusicStatus(@Path("guildId") guildId: String): Response<MusicStatus>
    
    @POST("bot/music/{guildId}/control")
    suspend fun controlMusic(
        @Path("guildId") guildId: String,
        @Body request: MusicControlRequest
    ): Response<SuccessResponse>
    
    // ========== Health ==========
    
    @GET("health")
    suspend fun getHealth(): Response<HealthResponse>
}
