'use client'

import { useState, useEffect, useCallback } from 'react'

interface LoadingStage {
    threshold: number
    message: string
    subMessage: string
}

const DEFAULT_STAGES: LoadingStage[] = [
    { threshold: 20, message: "Authenticating", subMessage: "Verifying your administrator session..." },
    { threshold: 50, message: "Synchronizing", subMessage: "Connecting to the global engine..." },
    { threshold: 80, message: "Loading Modules", subMessage: "Preparing dashboards and analytics..." },
    { threshold: 95, message: "Finishing Up", subMessage: "Optimizing your experience..." }
]

export const useLoadingProgress = (isComplete: boolean = false) => {
    const [progress, setProgress] = useState(0)
    const [currentStage, setCurrentStage] = useState(DEFAULT_STAGES[0])

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isComplete) {
            // Fast forward to 100%
            timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(timer)
                        return 100
                    }

                    // Fast acceleration to 100
                    const next = Math.min(prev + 5, 100)

                    // Update stage message based on new progress
                    const stage = DEFAULT_STAGES.find(s => next <= s.threshold) || DEFAULT_STAGES[DEFAULT_STAGES.length - 1]
                    setCurrentStage(stage)

                    return next
                })
            }, 50)
        } else {
            // Normal loading simulation
            timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 98) return prev

                    // Slower growth as it reaches higher numbers
                    const increment = prev < 50 ? 2 : prev < 80 ? 1 : 0.5
                    const next = Math.min(prev + increment, 98)

                    // Update stage message
                    const stage = DEFAULT_STAGES.find(s => next <= s.threshold) || DEFAULT_STAGES[DEFAULT_STAGES.length - 1]
                    setCurrentStage(stage)

                    return next
                })
            }, 150)
        }

        return () => clearInterval(timer)
    }, [isComplete])

    return {
        progress,
        message: currentStage.message,
        subMessage: currentStage.subMessage
    }
}
