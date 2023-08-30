import type { NextFunction, Response } from 'express'

import type { SanitizedCollectionConfig } from '../collections/config/types.js'
import type { PayloadRequest } from '../express/types.js'
import type { Where } from '../types/index.js'

import { Forbidden } from '../errors/index.js'
import executeAccess from './executeAccess.js'

const getExecuteStaticAccess =
  (config: SanitizedCollectionConfig) =>
  async (req: PayloadRequest, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }

    try {
      if (req.path) {
        const accessResult = await executeAccess(
          { isReadingStaticFile: true, req },
          config.access.read,
        )

        if (typeof accessResult === 'object') {
          const filename = decodeURI(req.path).replace(/^\/|\/$/g, '')

          const queryToBuild: Where = {
            and: [
              {
                or: [
                  {
                    filename: {
                      equals: filename,
                    },
                  },
                ],
              },
              accessResult,
            ],
          }

          if (config.upload.imageSizes) {
            config.upload.imageSizes.forEach(({ name }) => {
              queryToBuild.and[0].or.push({
                [`sizes.${name}.filename`]: {
                  equals: filename,
                },
              })
            })
          }

          const doc = await req.payload.db.findOne({
            collection: config.slug,
            where: queryToBuild,
          })

          if (!doc) {
            throw new Forbidden(req.t)
          }
        }
      }

      return next()
    } catch (error) {
      return next(error)
    }
  }

export default getExecuteStaticAccess