# حذف الملفات المتبقية للمدونة

# حذف مجلد المدونة
Remove-Item -Path "D:\Work\Coding\Omnira\app\blog" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Blog folder deleted successfully"

# حذف ملفات API المدونة
Remove-Item -Path "D:\Work\Coding\Omnira\lib\blog-api.ts" -Force -ErrorAction SilentlyContinue
Write-Host "Blog API file deleted successfully"

# حذف ملف schema المدونة إذا كان موجودًا
Remove-Item -Path "D:\Work\Coding\Omnira\lib\blog-schema.ts" -Force -ErrorAction SilentlyContinue
Write-Host "Blog schema file deleted if exists"

# حذف مكونات المدونة
Remove-Item -Path "D:\Work\Coding\Omnira\components\blog" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Blog components deleted if exists"
