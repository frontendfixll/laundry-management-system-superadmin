/**
 * Notification Sound System for SuperAdmin
 * Handles audio alerts for different priority levels
 */

interface SoundConfig {
  file: string
  volume: number
  loop?: boolean
  duration?: number
}

const SOUND_CONFIGS: Record<string, SoundConfig> = {
  P0: {
    file: '/sounds/critical-alert.mp3',
    volume: 0.8,
    loop: false
  },
  P1: {
    file: '/sounds/high-priority.mp3',
    volume: 0.6,
    loop: false
  },
  P2: {
    file: '/sounds/medium-priority.mp3',
    volume: 0.4,
    loop: false
  },
  P3: {
    file: '/sounds/low-priority.mp3',
    volume: 0.3,
    loop: false
  },
  default: {
    file: '/sounds/notification.mp3',
    volume: 0.5,
    loop: false
  }
}

class NotificationSoundManager {
  private audioContext: AudioContext | null = null
  private soundBuffers: Map<string, AudioBuffer> = new Map()
  private isEnabled: boolean = true
  private currentlyPlaying: Set<string> = new Set()

  constructor() {
    this.initializeAudioContext()
    this.loadSounds()
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  private async loadSounds() {
    for (const [priority, config] of Object.entries(SOUND_CONFIGS)) {
      try {
        await this.loadSound(priority, config.file)
      } catch (error) {
        console.warn(`Failed to load sound for ${priority}:`, error)
      }
    }
  }

  private async loadSound(priority: string, file: string): Promise<void> {
    if (!this.audioContext) return

    try {
      const response = await fetch(file)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      this.soundBuffers.set(priority, audioBuffer)
      
      console.log(`✅ Loaded sound for ${priority}`)
    } catch (error) {
      console.warn(`Failed to load sound ${file}:`, error)
      // Try to load fallback sound
      if (priority !== 'default') {
        await this.loadFallbackSound(priority)
      }
    }
  }

  private async loadFallbackSound(priority: string): Promise<void> {
    const fallbackFiles = [
      '/notification-sound.mp3',
      '/sounds/notification.mp3',
      '/notification.mp3'
    ]

    for (const fallbackFile of fallbackFiles) {
      try {
        const response = await fetch(fallbackFile)
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer)
          this.soundBuffers.set(priority, audioBuffer)
          console.log(`✅ Loaded fallback sound for ${priority}: ${fallbackFile}`)
          return
        }
      } catch (error) {
        continue
      }
    }
    
    console.warn(`No fallback sound available for ${priority}`)
  }

  public async playNotificationSound(priority: string = 'default'): Promise<void> {
    if (!this.isEnabled || !this.audioContext) {
      return
    }

    // Prevent multiple instances of the same sound
    if (this.currentlyPlaying.has(priority)) {
      return
    }

    const config = SOUND_CONFIGS[priority] || SOUND_CONFIGS.default
    const buffer = this.soundBuffers.get(priority) || this.soundBuffers.get('default')

    if (!buffer) {
      console.warn(`No sound buffer available for priority ${priority}`)
      return
    }

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = buffer
      gainNode.gain.value = config.volume

      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      this.currentlyPlaying.add(priority)

      source.onended = () => {
        this.currentlyPlaying.delete(priority)
      }

      source.start(0)

      console.log(`🔊 Playing ${priority} notification sound`)

    } catch (error) {
      console.error(`Failed to play sound for ${priority}:`, error)
      this.currentlyPlaying.delete(priority)
    }
  }

  public async playCriticalAlert(): Promise<void> {
    await this.playNotificationSound('P0')
    
    // For critical alerts, also try browser notification sound
    if ('Notification' in window && Notification.permission === 'granted') {
      // Browser will handle its own notification sound
    }
  }

  public async playHighPriorityAlert(): Promise<void> {
    await this.playNotificationSound('P1')
  }

  public async playMediumPriorityAlert(): Promise<void> {
    await this.playNotificationSound('P2')
  }

  public async playLowPriorityAlert(): Promise<void> {
    await this.playNotificationSound('P3')
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    console.log(`🔊 Notification sounds ${enabled ? 'enabled' : 'disabled'}`)
  }

  public isAudioEnabled(): boolean {
    return this.isEnabled && !!this.audioContext
  }

  public getLoadedSounds(): string[] {
    return Array.from(this.soundBuffers.keys())
  }

  public async testSound(priority: string = 'default'): Promise<void> {
    console.log(`🧪 Testing sound for ${priority}`)
    await this.playNotificationSound(priority)
  }

  public stopAllSounds(): void {
    // Note: We can't stop sounds that are already playing with Web Audio API
    // But we can prevent new ones from starting
    this.currentlyPlaying.clear()
  }
}

// Create singleton instance
const notificationSoundManager = new NotificationSoundManager()

// Export convenience functions
export const playNotificationSound = (priority: string) => 
  notificationSoundManager.playNotificationSound(priority)

export const playCriticalAlert = () => 
  notificationSoundManager.playCriticalAlert()

export const playHighPriorityAlert = () => 
  notificationSoundManager.playHighPriorityAlert()

export const playMediumPriorityAlert = () => 
  notificationSoundManager.playMediumPriorityAlert()

export const playLowPriorityAlert = () => 
  notificationSoundManager.playLowPriorityAlert()

export const setNotificationSoundsEnabled = (enabled: boolean) => 
  notificationSoundManager.setEnabled(enabled)

export const isNotificationSoundsEnabled = () => 
  notificationSoundManager.isAudioEnabled()

export const testNotificationSound = (priority: string) => 
  notificationSoundManager.testSound(priority)

export const getLoadedSounds = () => 
  notificationSoundManager.getLoadedSounds()

export const stopAllNotificationSounds = () => 
  notificationSoundManager.stopAllSounds()

export default notificationSoundManager