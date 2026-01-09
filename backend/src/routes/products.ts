import { Router, Request, Response } from 'express';
import { supabase, type Product } from '../config/supabase.js';
import { asyncHandler, validate } from '../middleware/validation.js';
import { 
  getProductsQuerySchema, 
  getProductByIdSchema,
  type GetProductsQuery 
} from '../schemas/index.js';

const router = Router();

// =====================================================
// GET /products
// List products with search, pagination, and sorting
// =====================================================
router.get(
  '/',
  validate(getProductsQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit, sort, order, category } = req.query as unknown as GetProductsQuery;
    
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Search filter (name, name_ar, description)
    if (search) {
      query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Sorting
    const sortColumn = sort || 'created_at';
    const sortOrder = order === 'asc' ? true : false;
    query = query.order(sortColumn, { ascending: sortOrder });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Products fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
      });
      return;
    }

    const totalPages = Math.ceil((count || 0) / limitNum);

    res.json({
      success: true,
      data: data as Product[],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  })
);

// =====================================================
// GET /products/:id
// Get single product by ID
// =====================================================
router.get(
  '/:id',
  validate(getProductByIdSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }
      
      console.error('Product fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
      });
      return;
    }

    res.json({
      success: true,
      data: data as Product,
    });
  })
);

export default router;
