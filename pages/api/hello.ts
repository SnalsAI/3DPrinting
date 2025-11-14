import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  message: string;
  timestamp: string;
  env: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.status(200).json({
    message: '3D Printing Platform API is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
}
