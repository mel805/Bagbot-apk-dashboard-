package com.bagbot.manager.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.bagbot.manager.data.api.ApiClient
import com.bagbot.manager.data.models.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "bagbot_prefs")

class BotRepository(private val context: Context) {
    
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("auth_token")
        private val USER_ID_KEY = stringPreferencesKey("user_id")
        private val USERNAME_KEY = stringPreferencesKey("username")
        private val AVATAR_KEY = stringPreferencesKey("avatar")
        private val BASE_URL_KEY = stringPreferencesKey("base_url")
    }
    
    // ========== Authentification et Préférences ==========
    
    suspend fun saveAuthToken(token: String) {
        context.dataStore.edit { prefs ->
            prefs[TOKEN_KEY] = token
        }
        ApiClient.setAuthToken(token)
    }
    
    suspend fun getAuthToken(): String? {
        return context.dataStore.data.map { prefs ->
            prefs[TOKEN_KEY]
        }.first()
    }
    
    suspend fun clearAuthToken() {
        context.dataStore.edit { prefs ->
            prefs.remove(TOKEN_KEY)
            prefs.remove(USER_ID_KEY)
            prefs.remove(USERNAME_KEY)
            prefs.remove(AVATAR_KEY)
        }
        ApiClient.setAuthToken(null)
    }
    
    suspend fun saveUserInfo(user: DiscordUser) {
        context.dataStore.edit { prefs ->
            prefs[USER_ID_KEY] = user.id
            prefs[USERNAME_KEY] = user.getDisplayName()
            user.avatar?.let { prefs[AVATAR_KEY] = it }
        }
    }
    
    suspend fun getUserInfo(): DiscordUser? {
        val prefs = context.dataStore.data.first()
        val userId = prefs[USER_ID_KEY] ?: return null
        val username = prefs[USERNAME_KEY] ?: return null
        
        return DiscordUser(
            id = userId,
            username = username.substringBefore("#"),
            discriminator = if ("#" in username) username.substringAfter("#") else "0",
            avatar = prefs[AVATAR_KEY]
        )
    }
    
    suspend fun saveBaseUrl(url: String) {
        context.dataStore.edit { prefs ->
            prefs[BASE_URL_KEY] = url
        }
        ApiClient.setBaseUrl(url)
    }
    
    suspend fun getBaseUrl(): String? {
        return context.dataStore.data.map { prefs ->
            prefs[BASE_URL_KEY]
        }.first()
    }
    
    fun isLoggedInFlow(): Flow<Boolean> {
        return context.dataStore.data.map { prefs ->
            prefs[TOKEN_KEY] != null
        }
    }
    
    // ========== API Calls ==========
    
    suspend fun getDiscordAuthUrl(): Result<AuthUrlResponse> {
        return try {
            val response = ApiClient.apiService.getDiscordAuthUrl()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Erreur lors de la récupération de l'URL d'authentification"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun authenticateWithDiscord(code: String): Result<AuthResponse> {
        return try {
            val response = ApiClient.apiService.authenticateWithDiscord(mapOf("code" to code))
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                saveAuthToken(authResponse.token)
                saveUserInfo(authResponse.user)
                Result.success(authResponse)
            } else {
                Result.failure(Exception("Échec de l'authentification"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun logout(): Result<Unit> {
        return try {
            ApiClient.apiService.logout()
            clearAuthToken()
            Result.success(Unit)
        } catch (e: Exception) {
            clearAuthToken()
            Result.success(Unit)
        }
    }
    
    suspend fun getBotStats(): Result<BotStats> {
        return try {
            val response = ApiClient.apiService.getBotStats()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Erreur lors de la récupération des statistiques"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getGuilds(): Result<List<Guild>> {
        return try {
            val response = ApiClient.apiService.getGuilds()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.guilds)
            } else {
                Result.failure(Exception("Erreur lors de la récupération des serveurs"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getGuildDetails(guildId: String): Result<GuildDetails> {
        return try {
            val response = ApiClient.apiService.getGuildDetails(guildId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Erreur lors de la récupération des détails du serveur"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCommands(): Result<List<BotCommand>> {
        return try {
            val response = ApiClient.apiService.getCommands()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.commands)
            } else {
                Result.failure(Exception("Erreur lors de la récupération des commandes"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getMusicStatus(guildId: String): Result<MusicStatus> {
        return try {
            val response = ApiClient.apiService.getMusicStatus(guildId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Erreur lors de la récupération du statut musical"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun controlMusic(guildId: String, action: String): Result<SuccessResponse> {
        return try {
            val response = ApiClient.apiService.controlMusic(
                guildId,
                MusicControlRequest(action)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Erreur lors du contrôle de la musique"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun banUser(guildId: String, userId: String, reason: String?): Result<SuccessResponse> {
        return try {
            val response = ApiClient.apiService.banUser(
                guildId,
                ModerationActionRequest(userId, reason)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Erreur lors du bannissement"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun kickUser(guildId: String, userId: String, reason: String?): Result<SuccessResponse> {
        return try {
            val response = ApiClient.apiService.kickUser(
                guildId,
                ModerationActionRequest(userId, reason)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Erreur lors de l'expulsion"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun checkHealth(): Result<HealthResponse> {
        return try {
            val response = ApiClient.apiService.getHealth()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Le bot ne répond pas"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
