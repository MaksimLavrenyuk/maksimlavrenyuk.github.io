Для использования firebase пушей необходимо подключить на страницах сайта скрипт
firebase-messaging.js и firebase-app.js актуальной версии:

<script src="https://www.gstatic.com/firebasejs/5.2.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/5.2.0/firebase-messaging.js"></script>

Файлы ak-push.js и manifest.json необходимо подключить к страницам сайта, на
которых планируется показ пользователям предложение подписаться на push-оповещения:

<script type="text/javascript" src="/ak-push.js"></script>
<link rel="manifest" href="/manifest.json"></link>

К файлу service-worker.js необходимо обеспечить доступ через корневую директорию сайта:

https://example.com/service-worker.js

ВАЖНО! Данный Toolkit необходимо обновлять после каждого изменения push-опций ресурса!
