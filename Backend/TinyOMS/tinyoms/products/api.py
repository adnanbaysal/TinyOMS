from django.db.models.deletion import ProtectedError
from rest_framework import (
    viewsets, permissions, filters, generics, parsers, status, serializers
)
from rest_framework.response import Response
from rest_framework.schemas import ManualSchema
from rest_framework.compat import coreapi, coreschema
from generics.permissions import StaffOnly
from generics.models import ExtraFieldAttributes, GenericImage
from generics.api import ProtectedErrorModelViewSet
from generics.helper import CustomPagination
from users.models import Supplier
from .models import Product, ProductImage
from .serializers import ProductSerializer, ProductImageSerializer


class ProductModelViewSet(ProtectedErrorModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, StaffOnly]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'description']
    # TODO: Fill extra fields with defaults

    def destroy(self, request, pk=None):
        if pk:
            product = Product.objects.filter(pk=pk).first()
            if product:
                product_id = product.id
                product.images.all().delete()
                efa = ExtraFieldAttributes.objects.filter(model_name='product')
                for attr in efa:
                    if attr.type_name == 'image':
                        extra_image_id = product.extra_field_values[attr.field_name]
                        if extra_image_id:
                            GenericImage.objects.filter(
                                id=extra_image_id).delete()
                try:
                    product.delete()
                except ProtectedError:
                    return Response({"protected_error": "cannot delete product!"}, 403)
                return Response({"deleted product id": product_id})
            else:
                return Response(
                    {"error": "product with pk does not exist!"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response({"error": "pk is mandatory"})


class ProductImageModelViewSet(viewsets.ModelViewSet):
    """
    list:
    Listing all images of all products is forbidden. 
    Use product_id query parameter 

    create:
    Make a new product image.

    read:
    get a product image with id.

    update: 
    update a product image with id.

    partial_update: 
    partially update a product image with id.

    delete: 
    delete a product image with id. optionally, to delete all images 
    of a product using product query parameter, send pk=0:
    DELETE /api/productimages/0/?product=1234
    """
    schema = ManualSchema(fields=[
        coreapi.Field(
            "product",
            required=True,
            location="query",
            schema=coreschema.String(),
            description="product=<int:product>"
        )
    ])

    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated, StaffOnly]
    pagination_class = CustomPagination

    def check_request_for_product(self, request):
        product_id = request.query_params.get("product")
        product, error = None, None
        if product_id:
            product = Product.objects.filter(id=product_id).first()
        if not product_id or not product:
            error = Response(
                {"error": "Invalid or missing product_id query parameter!"},
                status=status.HTTP_403_FORBIDDEN
            )
        return product, error

    def list(self, request):
        product, error = self.check_request_for_product(request)
        if error:
            return error
        return Response(
            [{"id": x.id, "image": x.image.url} for x in product.images.all()]
        )

    def create(self, request):
        product, error = self.check_request_for_product(request)
        if error:
            return error
        image = request.data.get("image")
        if image:
            product_image = ProductImage.objects.create(
                product=product, image=image)
            return Response({
                "id": product_image.id,
                "product_id": product_image.product.id,
                "image": product_image.image.url
            })
        return Response(
            {"error": "No image sent!"},
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, pk=None):
        if pk and pk != "0":
            product_image = ProductImage.objects.filter(pk=pk).first()
            if product_image:
                image_id = product_image.id
                product_image.delete()
                return Response({"deleted image id": image_id})
            else:
                return Response(
                    {"error": "product image with pk does not exist!"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        product, error = self.check_request_for_product(request)
        if error:
            return error
        num_images = len(product.images.all())
        product.images.all().delete()
        return Response({"number of deleted images": num_images})


class SupplierProductsAPIView(generics.GenericAPIView):
    serializer_class = serializers.Serializer
    permission_classes = [permissions.IsAuthenticated, StaffOnly]

    def patch(self, request, *args, **kwargs):
        """ deletes old products and replaces by thw new products sent"""
        supplier_id = request.data.get("supplier_id")
        if not supplier_id:
            return Response({"error": "supplier_id parameter is mandatory!"}, status=400)
        supplier = Supplier.objects.filter(id=supplier_id).first()
        if not supplier:
            return Response({"error": "supplier cannot be found!"}, status=404)
        product_ids = request.data.get("product_ids")
        num_deleted = len(supplier.products.all())
        supplier.products.clear()
        num_added_products = 0
        for pid in product_ids:
            product = Product.objects.filter(id=pid).first()
            if product:
                supplier.products.add(product)
                num_added_products += 1
        return Response({
            "success": f"{num_deleted} old products replaced by {num_added_products} / {len(product_ids)} new products!"
        })

    def post(self, request, *args, **kwargs):
        supplier_id = request.data.get("supplier_id")
        if not supplier_id:
            return Response({"error": "supplier_id parameter is mandatory!"}, status=400)
        supplier = Supplier.objects.filter(id=supplier_id).first()
        if not supplier:
            return Response({"error": "supplier cannot be found!"}, status=404)
        product_ids = request.data.get("product_ids")
        num_added_products = 0
        for pid in product_ids:
            product = Product.objects.filter(id=pid).first()
            if product:
                supplier.products.add(product)
                num_added_products += 1
        return Response({"success": f"{num_added_products} products added including duplicates!"})

    def delete(self, request, *args, **kwargs):
        supplier_id = request.data.get("supplier_id")
        if not supplier_id:
            return Response({"error": "supplier_id parameter is mandatory!"}, status=400)
        supplier = Supplier.objects.filter(id=supplier_id).first()
        if not supplier:
            return Response({"error": "supplier cannot be found!"}, status=404)
        product_ids = request.data.get("product_ids")
        num_removed_products = 0
        for pid in product_ids:
            product = Product.objects.filter(id=pid).first()
            if product:
                supplier.products.remove(product)
                num_removed_products += 1
        return Response({"success": f"{num_removed_products} products removed!"})
