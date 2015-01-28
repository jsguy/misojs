# Miso storage adaptors

The Miso database adaptor is a lightweight two way serialisation service that can transport miso models to/from a storage adaptor. It does not make any assumptions about how the underlying database functions, the only requirement is to follow this convention:

* create an adaptor file: [name].adaptor.js
