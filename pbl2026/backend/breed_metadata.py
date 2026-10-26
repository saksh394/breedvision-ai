# Maps each trained breed class to its animal type.
# Buffalo breeds confirmed from the dataset's 41 classes; everything else is Cattle.
# Edit this list if your actual breed list differs.

BUFFALO_BREEDS = {
    "Murrah",
    "Jaffrabadi",
    "Bhadawari",
    "Banni",
    "Nili_Ravi",
    "Surti",
}


def get_animal_type(breed_name: str) -> str:
    return "Buffalo" if breed_name in BUFFALO_BREEDS else "Cattle"


def get_breed_status(confidence: float, threshold: float = 60.0) -> str:
    """
    Heuristic placeholder: low-confidence top prediction is flagged as a
    possible crossbreed rather than asserted as a pure breed. Tune the
    threshold once you have real validation data on how confidence
    correlates with crossbred/non-descript animals in your test set.
    """
    return "Pure" if confidence >= threshold else "Crossbreed"
