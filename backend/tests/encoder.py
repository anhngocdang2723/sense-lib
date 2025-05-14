from sentence_transformers import SentenceTransformer
model = SentenceTransformer('dangvantuan/vietnamese-embedding')
print(model.encode(["test"]))
print(model.encode([""]))
print(model.encode([" ", "test"]))