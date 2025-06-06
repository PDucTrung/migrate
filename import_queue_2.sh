#!/bin/bash

FILE_LIST="import_list_2.txt"
IMPORT_DIR="./dumps"

while IFS=, read -r filename yarn_cmd || [ -n "$filename" ]; do
  FILE_PATH="$IMPORT_DIR/$filename"

  if [ -f "$FILE_PATH" ]; then
    echo "⏳ Importing $filename with command: yarn $yarn_cmd..."
    yarn "$yarn_cmd" "$FILE_PATH"

    if [ $? -eq 0 ]; then
      echo "✅ Imported $filename, removing from list..."
      sed -i "/^$filename,$yarn_cmd$/d" "$FILE_LIST"
    else
      echo "❌ Failed to import $filename, skipping..."
    fi
  else
    echo "⚠️ File $filename not found, skipping..."
  fi

  echo "-------------------------"
done < "$FILE_LIST"
