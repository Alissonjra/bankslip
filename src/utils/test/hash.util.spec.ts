import { generateHashFromFile } from '../hash.util'
import * as fs from 'fs'

jest.mock('fs')
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-hash'),
  }),
}))

describe('@unit generateHashFromFile', () => {
  it('should generate hash from file', async () => {
    const mockFilePath = 'mock-file.txt'
    const mockStream = {
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('test data'))
        }
        if (event === 'end') {
          callback()
        }
        return mockStream
      }),
    }

    ;(fs.createReadStream as jest.Mock).mockReturnValue(mockStream)

    const hash = await generateHashFromFile(mockFilePath)

    expect(fs.createReadStream).toHaveBeenCalledWith(mockFilePath)
    expect(mockStream.on).toHaveBeenCalledWith('data', expect.any(Function))
    expect(mockStream.on).toHaveBeenCalledWith('end', expect.any(Function))
    expect(hash).toBe('mocked-hash')
  })

  it('should handle error when reading file', async () => {
    const mockFilePath = 'mock-file.txt'
    const mockStream = {
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(new Error('File read error'))
        }
        return mockStream
      }),
    }

    ;(fs.createReadStream as jest.Mock).mockReturnValue(mockStream)

    await expect(generateHashFromFile(mockFilePath)).rejects.toThrow('File read error')
  })
})
