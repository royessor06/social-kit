import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { randomUUID } from 'crypto'
import { join } from 'path'
import sharp from 'sharp'
import { put } from '@vercel/blob'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

function getImageType(buffer: Buffer) {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return { extension: 'png' }
  }
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { extension: 'jpg' }
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { extension: 'webp' }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return Response.json({ error: 'Fichier requis' }, { status: 400 })
    }

    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      return Response.json(
        { error: 'L’image doit faire entre 1 octet et 5 Mo' },
        { status: 413 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const imageType = getImageType(buffer)

    if (!imageType) {
      return Response.json(
        { error: 'Formats acceptés : PNG, JPEG et WebP' },
        { status: 400 }
      )
    }

    let normalized: Buffer
    try {
      const image = sharp(buffer, { limitInputPixels: 16_000_000 }).rotate()
      normalized =
        imageType.extension === 'png'
          ? await image.png({ compressionLevel: 9 }).toBuffer()
          : imageType.extension === 'webp'
            ? await image.webp({ quality: 85 }).toBuffer()
            : await image.jpeg({ quality: 85 }).toBuffer()
    } catch {
      return Response.json({ error: 'Le fichier image est invalide' }, { status: 400 })
    }

    if (normalized.length > MAX_UPLOAD_BYTES) {
      return Response.json(
        { error: 'L’image traitée dépasse la limite de 5 Mo' },
        { status: 413 }
      )
    }

    const filename = `${randomUUID()}.${imageType.extension}`
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${filename}`, normalized, {
        access: 'public',
        contentType:
          imageType.extension === 'png'
            ? 'image/png'
            : imageType.extension === 'webp'
              ? 'image/webp'
              : 'image/jpeg',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      return Response.json(
        { url: blob.url },
        { headers: { 'X-Content-Type-Options': 'nosniff' } }
      )
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const path = join(uploadDir, filename)
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path, normalized, { flag: 'wx' })

    return Response.json(
      { url: `/uploads/${filename}` },
      { headers: { 'X-Content-Type-Options': 'nosniff' } }
    )
  } catch (error) {
    console.error("Erreur d'upload :", error)
    return Response.json({ error: "Erreur serveur lors de l'upload" }, { status: 500 })
  }
}