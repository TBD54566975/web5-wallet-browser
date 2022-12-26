```javascript
web5.dwn.processMessage({
  method : 'CollectionsWrite',
  data   : {
    id          : uuidv4(),
    description : newTodoDescription.value,
    completed   : false
  }
});
```

**Note**: wallet should take care of fully constructing a DWeb message.
    - why?
      - to improve developer experience. Devs should be able to provide bare minimum to do all the thingz
      - Wallet holds keys. Let the wallet take care of the sticky crypto stuff
  - Specifically, constructing a DWebMessage includes:
    - Signing the message
      - Sign using which key?
        - to start, the user's DID. More specifically, whichever DID the user decides to associate to the site that's writing data
    - Serializing the data
      - this could be tricky since `data` can be any arbitrary type
    - 

**Note**: `processMessage` should probably handle fully constructed (aka signed) DWeb Messages and also bare minimum requirements.