<?php

class Env {
    private static ?array $values = null;

    public static function load(string $path = null): void {
        if (self::$values !== null) {
            return;
        }

        $pathsToCheck = [];
        if ($path !== null) {
            $pathsToCheck[] = $path;
        }
        $pathsToCheck[] = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.env';
        $pathsToCheck[] = dirname(__DIR__, 1) . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'config.template.env';

        self::$values = [];

        foreach ($pathsToCheck as $filePath) {
            if (!file_exists($filePath)) {
                continue;
            }

            $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#')) {
                    continue;
                }
                if (!str_contains($line, '=')) {
                    continue;
                }
                [$key, $value] = array_map('trim', explode('=', $line, 2));
                $value = trim($value, "\"'");
                self::$values[$key] = $value;
            }
            // stop once we've loaded a real .env file
            if (str_ends_with($filePath, '.env')) {
                break;
            }
        }
    }

    public static function get(string $key, $default = null) {
        if (self::$values === null) {
            self::load();
        }
        return self::$values[$key] ?? $default;
    }
}
?>

