rrsync -r src/ docs/
rrsync build/contracts/* docs/
git add .
git commit -m "Compiles assets for Github Pages"
git push
