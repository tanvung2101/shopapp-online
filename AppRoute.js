import express from "express";
const router = express.Router();

import * as ProductController from "./controllers/ProductController.js";
import * as CategoryController from "./controllers/CategoryController.js";
import * as BrandController from "./controllers/BrandController.js";
import * as OrderController from "./controllers/OrderController.js";
import * as UserController from "./controllers/UserController.js";
import * as OrderDetailController from "./controllers/OrderDetailController.js";
import * as NewsController from "./controllers/NewsController.js";
import * as NewsDetailController from "./controllers/NewsDetailController.js";
import * as BannerController from "./controllers/BannerController.js";
import * as BannerDetailController from "./controllers/BannerDetailController.js";
import * as ImageController from "./controllers/ImageController.js";
import * as ProductImageController from "./controllers/ProductImageController.js";
import * as CartController from "./controllers/CartController.js";
import * as CartItemController from "./controllers/CartItemController.js";
import asyncHandler from "./middlewares/asyncHandler.js";
import validate, { emailValidator } from "./middlewares/validate.js";
import InsertProductRequest from "./dtos/requests/product/InsertProductRequest.js";
import UpdateProductRequest from "./dtos/requests/product/UpdateProductRequest.js";
import InsertUserRequest from "./dtos/requests/users/InsertUserRequest.js";
import LoginUserRequest from "./dtos/requests/users/LoginUserRequest.js";

import InsertNewsRequest from "./dtos/requests/news/InsertNewsRequest.js";
import InsertNewsDetailRequest from "./dtos/requests/newsdetail/InsertNewsDetailsRequest.js";
import UpdateNewsRequest from "./dtos/requests/news/UpdateNewsRequest.js";
import InsertBannerRequest from "./dtos/requests/banner/InsertBannerRequest.js";
import InsertBannerDetailRequest from "./dtos/requests/banner_detail/InsertBannerDetailsRequest.js";
import uploadImageMiddleware from "./middlewares/imageUpload.js";
import validateImageExists from "./middlewares/validateImageExists.js";
import uploadGoogleImageMiddleware from "./middlewares/imageGoogleUpload.js";
import InsertProductImageRequest from "./dtos/requests/product_image/InsertProductImageRequest.js";
import InsertCartRequest from "./dtos/cart/InsertCartRequest.js";
import InsertCartItemRequest from "./dtos/cart_item/InsertCartItemRequest.js";
import UpdateOrderRequest from "./dtos/requests/order/UpdateOrderRequest.js";
import { requireRoles } from "./middlewares/jwtMiddlewares.js";
import { UserRole } from "./constants/index.js";
import { verifyForgotPasswordToken } from "./helpers/jwt.js";
import ImageUploadS3 from "./helpers/s3.js"

export function AppRoute(app) {
  // Users Routes
  router.post(
    "/users/register",
    validate(InsertUserRequest),
    asyncHandler(UserController.registerUser)
  );
  router.post(
    "/users/login",
    validate(LoginUserRequest),
    asyncHandler(UserController.loginUser)
  );

  router.put(
    "/users/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(UserController.updateUser)
  );

  router.get(
    "/users/me/:id",
    requireRoles([UserRole.ADMIN, UserRole.USER]),
    asyncHandler(UserController.getUserById)
  );

  router.get("/users/refresh-token", UserController.getRefreshToken);
  router.post(
    "/users/forgot-password",
    emailValidator,
    UserController.forgotPassword
  );
  router.post(
    "/users/rest-password",
    verifyForgotPasswordToken,
    UserController.restPassword
  );

  // Product Routes
  router.get("/products", asyncHandler(ProductController.getProducts));
  router.get("/products/:id", asyncHandler(ProductController.getProductById));
  router.post(
    "/products",
    requireRoles([UserRole.ADMIN]),
    validateImageExists,
    validate(InsertProductRequest),
    asyncHandler(ProductController.insertProducts)
  );
  router.put(
    "/products/:id",
    requireRoles([UserRole.ADMIN]),
    validateImageExists,
    validate(UpdateProductRequest),
    asyncHandler(ProductController.updateProducts)
  );
  router.delete(
    "/product/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(ProductController.deleteProducts)
  );

  // ProductImage Router
  router.get(
    "/product-images",
    asyncHandler(ProductImageController.getProductImages)
  );
  router.get(
    "/product-images/:id",
    asyncHandler(ProductImageController.getProductImageById)
  );
  router.post(
    "/product-images",
    requireRoles([UserRole.ADMIN]),
    validate(InsertProductImageRequest),
    asyncHandler(ProductImageController.insertProductImage)
  );

  router.delete(
    "/product-images/:id",
    asyncHandler(ProductImageController.deleteCategory)
  );

  // Category Routes
  router.get("/categories", asyncHandler(CategoryController.getCategories));
  router.get(
    "/categories/:id",
    asyncHandler(CategoryController.getCategoryById)
  );
  router.post(
    "/categories",
    requireRoles([UserRole.ADMIN]),
    validateImageExists,
    asyncHandler(CategoryController.insertCategory)
  );
  router.put(
    "/categories/:id",
    requireRoles([UserRole.ADMIN]),
    validateImageExists,
    asyncHandler(CategoryController.updateCategory)
  );
  router.delete(
    "/categories/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(CategoryController.deleteCategory)
  );

  // Brand Routes
  router.get("/brands", asyncHandler(BrandController.getBrands));
  router.get("/brands/:id", asyncHandler(BrandController.getBrandById));
  router.post(
    "/brands",
    requireRoles([UserRole.ADMIN]),
    validateImageExists,
    asyncHandler(BrandController.insertBrand)
  );
  router.put(
    "/brands/:id",
    requireRoles([UserRole.ADMIN]),
    validateImageExists,
    asyncHandler(BrandController.updateBrand)
  );
  router.delete(
    "/brands/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(BrandController.deleteBrand)
  );

  // Order Routes
  router.get("/orders", asyncHandler(OrderController.getOrders));
  router.get("/orders/:id", asyncHandler(OrderController.getOrderById));
  // router.post(
  //   "/orders",
  //   validate(InsertOrderRequest),
  //   asyncHandler(OrderController.insertOrder)
  // );
  router.put(
    "/orders",
    requireRoles([UserRole.ADMIN, UserRole.USER]),
    asyncHandler(OrderController.updateOrder)
  );
  router.delete(
    "/orders/:id",
    requireRoles([UserRole.ADMIN]),
    validate(UpdateOrderRequest),
    asyncHandler(OrderController.deleteOrder)
  );

  // OrderDetail Routes
  router.get(
    "/order-details",
    asyncHandler(OrderDetailController.getOrderDetails)
  );
  router.get(
    "/order-details/:id",
    asyncHandler(OrderDetailController.getOrderDetailById)
  );
  router.post(
    "/order-details",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(OrderDetailController.insertOrderDetail)
  );
  router.put(
    "/order-details",
    asyncHandler(OrderDetailController.updateOrderDetails)
  );
  router.delete(
    "/order-details/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(OrderDetailController.deleteOrderDetail)
  );

  // Cart Router
  router.get("/carts", asyncHandler(CartController.getCarts));
  router.get(
    "/carts/:id",
    requireRoles([UserRole.ADMIN, UserRole.USER]),
    asyncHandler(CartController.getCartById)
  );
  router.post(
    "/carts",
    requireRoles([UserRole.ADMIN]),
    validate(InsertCartRequest),
    asyncHandler(CartController.insertCart)
  );
  router.post("/carts/checkout", asyncHandler(CartController.checkoutCart));
  router.post(
    "/carts/vnpay_return",
    asyncHandler(CartController.paymentSuccess)
  );
  router.delete(
    "/carts/:id",
    requireRoles([UserRole.USER]),
    asyncHandler(CartController.deleteCart)
  );

  // CartItem Router

  router.get("/cart-items", asyncHandler(CartItemController.getCartItems));
  router.get(
    "/cart-items/carts/:cart_id",
    asyncHandler(CartItemController.getCartItemByCartId)
  );
  router.get(
    "/cart-items/:id",
    asyncHandler(CartItemController.getCartItemById)
  );
  router.post(
    "/cart-items",
    requireRoles([UserRole.USER, UserRole.ADMIN]),
    validate(InsertCartItemRequest),
    asyncHandler(CartItemController.insertCartItems)
  );
  router.put(
    "/carts/:id",
    requireRoles([UserRole.USER]),
    asyncHandler(CartItemController.updateCartItem)
  );
  router.delete(
    "/cart-items/:id",
    requireRoles([UserRole.ADMIN, UserRole.USER]),
    asyncHandler(CartItemController.deleteCartItem)
  );

  // News Routes
  router.get("/news", asyncHandler(NewsController.getNews));
  router.get("/news/:id", asyncHandler(NewsController.getNewsArticleById));
  router.post(
    "/news",
    requireRoles([UserRole.ADMIN]),
    validateImageExists,
    validate(InsertNewsRequest),
    asyncHandler(NewsController.insertNewsArticle)
  );
  router.put(
    "/news/:id",
    requireRoles([UserRole.ADMIN]),
    validateImageExists,
    asyncHandler(NewsController.updateNewsArticle)
  );
  router.delete(
    "/news/:id",
    requireRoles([UserRole.ADMIN]),
    validate(UpdateNewsRequest),
    asyncHandler(NewsController.deleteNewsArticle)
  );

  // NewsDetails Routes
  router.get(
    "/news-details",
    asyncHandler(NewsDetailController.getNewsDetails)
  );
  router.get(
    "/news-details/:id",
    asyncHandler(NewsDetailController.getNewsDetailsById)
  );
  router.post(
    "/news-details",
    requireRoles([UserRole.ADMIN]),
    validate(InsertNewsDetailRequest),
    asyncHandler(NewsDetailController.insertNewsDetail)
  );
  router.put(
    "/news-details/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(NewsDetailController.updateNewsDetail)
  );
  router.delete(
    "/news-details/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(NewsDetailController.deleteNewsDetail)
  );

  // Banner Routes
  router.get("/banners", asyncHandler(BannerController.getBanners));
  router.get("/banners/:id", asyncHandler(BannerController.getBannerById));
  router.post(
    "/banners",
    requireRoles([UserRole.ADMIN]),
    validate(InsertBannerRequest),
    validateImageExists,
    asyncHandler(BannerController.insertBanner)
  );
  router.put(
    "/banners/:id",
    requireRoles([UserRole.ADMIN]),
    validateImageExists,
    asyncHandler(BannerController.updateBanner)
  );
  router.delete(
    "/banners/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(BannerController.deleteBanner)
  );

  // BannerDetail Routes
  router.get(
    "/banner-details",
    asyncHandler(BannerDetailController.getBannerDetails)
  );
  router.get(
    "/banner-details/:id",
    asyncHandler(BannerDetailController.getBannerDetailById)
  );
  router.post(
    "/banner-details",
    requireRoles([UserRole.ADMIN]),
    validate(InsertBannerDetailRequest),
    asyncHandler(BannerDetailController.insertBannerDetail)
  );
  router.put(
    "/banner-details/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(BannerDetailController.updateBannerDetail)
  );
  router.delete(
    "/banner-details/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(BannerDetailController.deleteBannerDetail)
  );

  // Image Router
  router.post(
    "/images/upload",
    requireRoles([UserRole.ADMIN, UserRole.USER]),
    uploadImageMiddleware.array("images", 5),
    asyncHandler(ImageController.uploadImages)
  );
  router.post(
    "/images/google/upload",
    requireRoles([UserRole.ADMIN, UserRole.USER]),
    uploadGoogleImageMiddleware.single("image"),
    asyncHandler(ImageController.uploadImagesToGoogleStorage)
  );
  router.get(
    "/images/:fileName",
    uploadImageMiddleware.array("images", 5),
    ImageController.viewImages
  );
  router.delete(
    "/images/delete",
    requireRoles([UserRole.ADMIN, UserRole.USER]),
    ImageController.deleteImage
  );

  router.post(
    "/images/upload/aws",
    ImageUploadS3.array("images", 5),
    ImageController.uploadImagesS3
  );

  router.delete(
    "/images/aws/delete",
    // requireRoles([UserRole.ADMIN, UserRole.USER]),
    ImageController.deleteAllFileVersions
  );

  app.use("/api/", router);
}
