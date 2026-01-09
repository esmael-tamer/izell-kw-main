import { Router, Request, Response } from 'express';
import { supabase, type StoreSettings } from '../config/supabase.js';
import { asyncHandler } from '../middleware/validation.js';

const router = Router();

// =====================================================
// GET /store-settings
// Returns store configuration (single row)
// =====================================================
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('store_name, store_name_ar, tagline')
      .limit(1)
      .single();

    if (error) {
      // If no settings exist, return defaults
      if (error.code === 'PGRST116') {
        res.json({
          success: true,
          data: {
            store_name: 'IZELL',
            store_name_ar: 'آيزل',
            tagline: 'Kuwait Fashion Store',
          },
        });
        return;
      }
      
      console.error('Store settings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch store settings',
      });
      return;
    }

    res.json({
      success: true,
      data: data as StoreSettings,
    });
  })
);

export default router;
