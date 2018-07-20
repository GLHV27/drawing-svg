# Drawing SVG Repository

## Сборка

Чтобы скомпилировать Drawing SVG самостоятельно, сначала убедитесь, что у вас установлены [Node.js](http://nodejs.org/) и [Webpack](https://github.com/webpack/webpack), а затем:

1) Склонируйте репозиторий

	git clone git@github.com:GLHV27/drawing-svg.git

2) Зайдите в папку и установите зависимости

	cd drawing-svg && npm install

3) Теперь просто запустите `npm run webpack-production` для создания `JS` и `CSS` в папке `dist`

Необязательно:
- Выполнить `npm run devserver` автоматическую перестройку скрипта при изменении файлов `src/`.