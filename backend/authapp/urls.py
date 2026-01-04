from django.urls import path
from .views import ClientRegistrationView, ClientLoginView, ProtectedView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

app_name = 'authapp'

urlpatterns = [
    path('register/', ClientRegistrationView.as_view(), name='register'),
    path('login/', ClientLoginView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('protected/', ProtectedView.as_view(), name='protected_view'),
]
