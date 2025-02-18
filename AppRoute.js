import express from "express";
const router = express.Router();

import * as ProductController from "./controllers/ProductController";
import * as CategoryController from "./controllers/CategoryController";
import * as BrandController from "./controllers/BrandController";
import * as OrderController from "./controllers/OrderController";
import * as UserController from "./controllers/UserController";
import * as OrderDetailController from "./controllers/OrderDetailController";
import * as NewsController from "./controllers/NewsController";
import * as NewsDetailController from "./controllers/NewsDetailController";
import * as BannerController from "./controllers/BannerController";
import * as BannerDetailController from "./controllers/BannerDetailController";
import * as ImageController from "./controllers/ImageController";
import asyncHandler from "./middlewares/asyncHandler";
import validate from "./middlewares/validate";
import InsertProductRequest from "./dtos/requests/product/InsertProductRequest";
import UpdateProductRequest from "./dtos/requests/product/UpdateProductRequest";
import InsertOrderRequest from "./dtos/requests/order/InsertOrderRequest";
import InsertUserRequest from "./dtos/requests/users/InsertUserRequest";
import InsertNewsRequest from "./dtos/requests/news/InsertNewsRequest";
import InsertNewsDetailRequest from "./dtos/requests/newsdetail/InsertNewsDetailsRequest";
import UpdateNewsRequest from "./dtos/requests/news/UpdateNewsRequest";
import InsertBannerRequest from "./dtos/requests/banner/InsertBannerRequest";
import InsertBannerDetailRequest from "./dtos/requests/banner_detail/InsertBannerDetailsRequest";
import uploadImageMiddleware from "./middlewares/imageUpload";
import validateImageExists from "./middlewares/validateImageExists";
import uploadGoogleImageMiddleware from "./middlewares/imageGoogleUpload"

export function AppRoute(app) {
  // Users Routes
  router.post(
    "/users",
    validate(InsertUserRequest),
    asyncHandler(UserController.insertUser)
  );
  // Product Routes
  router.get("/products", asyncHandler(ProductController.getProducts));
  router.get("/products/:id", asyncHandler(ProductController.getProductById));
  router.post(
    "/products",
    validateImageExists,
    validate(InsertProductRequest),
    asyncHandler(ProductController.insertProducts)
  );
  router.put(
    "/products",
    validateImageExists,
    validate(validate(UpdateProductRequest)),
    asyncHandler(ProductController.updateProducts)
  );
  router.delete("/product/:id", asyncHandler(ProductController.deleteProducts));

  // Category Routes
  router.get("/categories", asyncHandler(CategoryController.getCategories));
  router.get(
    "/categories/:id",
    asyncHandler(CategoryController.getCategoryById)
  );
  router.post("/categories",validateImageExists, asyncHandler(CategoryController.insertCategory));
  router.put("/categories/:id",validateImageExists, asyncHandler(CategoryController.updateCategory));
  router.delete(
    "/categories/:id",
    asyncHandler(CategoryController.deleteCategory)
  );

  // Brand Routes
  router.get("/brands", asyncHandler(BrandController.getBrands));
  router.get("/brands/:id", asyncHandler(BrandController.getBrandById));
  router.post("/brands",validateImageExists, asyncHandler(BrandController.insertBrand));
  router.put("/brands",validateImageExists, asyncHandler(BrandController.updateBrand));
  router.delete("/brands/:id", asyncHandler(BrandController.deleteBrand));

  // Order Routes
  router.get("/orders", asyncHandler(OrderController.getOrders));
  router.get("/orders/:id", asyncHandler(OrderController.getOrderById));
  router.post(
    "/orders",
    validate(InsertOrderRequest),
    asyncHandler(OrderController.insertOrder)
  );
  router.put("/orders", asyncHandler(OrderController.updateOrder));
  router.delete("/orders/:id", asyncHandler(OrderController.deleteOrder));

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
    asyncHandler(OrderDetailController.insertOrderDetail)
  );
  router.put(
    "/order-details",
    asyncHandler(OrderDetailController.updateOrderDetails)
  );
  router.delete(
    "/order-details/:id",
    asyncHandler(OrderDetailController.deleteOrderDetail)
  );

  // News Routes
  router.get("/news", asyncHandler(NewsController.getNews));
  router.get("/news/:id", asyncHandler(NewsController.getNewsArticleById));
  router.post(
    "/news",
    validateImageExists,
    validate(InsertNewsRequest),
    asyncHandler(NewsController.insertNewsArticle)
  );
  router.put("/news/:id",validateImageExists, asyncHandler(NewsController.updateNewsArticle));
  router.delete(
    "/news/:id",
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
    validate(InsertNewsDetailRequest),
    asyncHandler(NewsDetailController.insertNewsDetail)
  );
  router.put(
    "/news-details/:id",
    asyncHandler(NewsDetailController.updateNewsDetail)
  );
  router.delete(
    "/news-details/:id",
    asyncHandler(NewsDetailController.deleteNewsDetail)
  );

  // Banner Routes
  router.get("/banners", asyncHandler(BannerController.getBanners));
  router.get("/banners/:id", asyncHandler(BannerController.getBannerById));
  router.post(
    "/banners",
    validate(InsertBannerRequest),
    validateImageExists,
    asyncHandler(BannerController.insertBanner)
  );
  router.put(
    "/banners/:id",
    validateImageExists,
    asyncHandler(BannerController.updateBanner)
  );
  router.delete("/banners/:id", asyncHandler(BannerController.deleteBanner));

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
    validate(InsertBannerDetailRequest),
    asyncHandler(BannerDetailController.insertBannerDetail)
  );
  router.put(
    "/banner-details/:id",
    asyncHandler(BannerDetailController.updateBannerDetail)
  );
  router.delete(
    "/banner-details/:id",
    asyncHandler(BannerDetailController.deleteBannerDetail)
  );

  router.post(
    "/images/upload",
    uploadImageMiddleware.array("images", 5),
    asyncHandler(ImageController.uploadImages)
  );
  router.post(
    "/images/google/upload",
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
    (ImageController.deleteImage)
  );

  app.use("/api/", router);
}
