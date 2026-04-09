# Regras de Segurança do Firestore

Para garantir que os dados financeiros fiquem completamente isolados e um usuário não consiga ver os lançamentos de outro usuário, você precisa aplicar regras de segurança rígidas no banco de dados.

## Como aplicar as regras:
1. Acesse o **Firebase Console**.
2. Vá no menu lateral em **Firestore Database**.
3. Clique na aba superior **Rules (Regras)**.
4. Apague o que estiver lá e cole todo o conteúdo do arquivo `firestore.rules` que geramos na raiz do projeto.
5. Clique em **Publish (Publicar)**.

Pronto! Seu aplicativo está blindado.
