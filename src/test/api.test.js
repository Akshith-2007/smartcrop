import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('axios', () => {
  const axiosMock = {
    create: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
  axiosMock.create.mockReturnValue(axiosMock)
  return { default: axiosMock }
})

import axios from 'axios'
import { authAPI, cropAPI, soilAPI, weatherAPI, marketAPI } from '../services/api'

describe('API Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Auth API', () => {
    it('should login with email and password', async () => {
      const mockResponse = { data: { authenticated: true, session_id: '123', email: 'test@example.com' } }
      axios.post.mockResolvedValue(mockResponse)

      const result = await authAPI.login('test@example.com', 'password123')
      expect(result.data.session_id).toBe('123')
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com', password: 'password123' })
    })

    it('should check session', async () => {
      const mockResponse = { data: { authenticated: true, email: 'test@example.com' } }
      axios.get.mockResolvedValue(mockResponse)

      const result = await authAPI.checkSession('123')
      expect(result.data.authenticated).toBe(true)
      expect(axios.get).toHaveBeenCalledWith('/api/auth/check-session', { headers: { 'x-session-id': '123' } })
    })
  })

  describe('Crop API', () => {
    it('should recommend crops', async () => {
      const mockResponse = { data: { recommendations: [], count: 0 } }
      axios.post.mockResolvedValue(mockResponse)

      const result = await cropAPI.recommend({ region: 'AP', season: 'rainy', soil_ph: 6.5 })
      expect(result.data).toHaveProperty('recommendations')
      expect(axios.post).toHaveBeenCalledWith('/api/crops/recommend', { region: 'AP', season: 'rainy', soil_ph: 6.5 })
    })
  })

  describe('Weather API', () => {
    it('should get weather advisory', async () => {
      const mockResponse = { data: { weather: {}, alerts: [] } }
      axios.get.mockResolvedValue(mockResponse)

      const result = await weatherAPI.getAdvisory({ lat: 17.68, lon: 83.22, timezone: 'Asia/Kolkata' })
      expect(result.data).toHaveProperty('weather')
      expect(axios.get).toHaveBeenCalledWith('/api/weather/advisory', { params: { lat: 17.68, lon: 83.22, timezone: 'Asia/Kolkata' } })
    })
  })
})

