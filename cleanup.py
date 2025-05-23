import os
import shutil

def delete_pycache():
    """Удаление директорий __pycache__ и временных файлов Python"""
    print("Удаление временных файлов Python...")
    for root, dirs, files in os.walk(".", topdown=False):
        for dir_name in dirs:
            if dir_name == "__pycache__":
                pycache_path = os.path.join(root, dir_name)
                shutil.rmtree(pycache_path, ignore_errors=True)
        for file_name in files:
            if file_name.endswith((".pyc", ".pyo")):
                file_path = os.path.join(root, file_name)
                os.remove(file_path)
    print("Временные файлы Python удалены.")

def delete_migrations():
    """Удаление файлов миграций, кроме __init__.py"""
    print("Удаление файлов миграций...")
    for root, dirs, files in os.walk(".", topdown=False):
        if "migrations" in dirs:
            migration_path = os.path.join(root, "migrations")
            for file_name in os.listdir(migration_path):
                if file_name != "__init__.py" and file_name.endswith(".py"):
                    os.remove(os.path.join(migration_path, file_name))
                elif file_name.endswith(".pyc"):
                    os.remove(os.path.join(migration_path, file_name))
    print("Файлы миграций удалены.")

def delete_node_modules():
    """Удаление папки node_modules"""
    print("Удаление папки node_modules...")
    for root, dirs, _ in os.walk(".", topdown=False):
        if "node_modules" in dirs:
            node_modules_path = os.path.join(root, "node_modules")
            shutil.rmtree(node_modules_path, ignore_errors=True)
    print("Папка node_modules удалена.")

def delete_package_lock():
    """Удаление файла package-lock.json"""
    print("Удаление файла package-lock.json...")
    for root, _, files in os.walk(".", topdown=False):
        for file_name in files:
            if file_name == "package-lock.json":
                os.remove(os.path.join(root, file_name))
    print("Файл package-lock.json удален.")

def main():
    delete_pycache()
    delete_migrations()
    delete_node_modules()
    delete_package_lock()
    print("Все временные файлы и директории успешно удалены!")

if __name__ == "__main__":
    main()
