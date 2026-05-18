# overrides to s9pk.mk must precede the include statement
# Leaf-level matrix targets: each <variant>-<arch> entry builds exactly one
# s9pk, so the release workflow's matrix fan-out can build all of them in
# parallel (instead of one runner serially building both arches of generic).
TARGETS := generic-x86 generic-arm cuda-x86 rocm-x86 openvino-x86
ARCHES := x86 arm

include s9pk.mk

.PHONY += generic cuda rocm openvino

# Aggregate variant targets so `make generic` still builds all generic arches.
generic: generic-x86 generic-arm
cuda: cuda-x86
rocm: rocm-x86
openvino: openvino-x86

# Variant leaf rules: <variant>-<arch> sets VARIANT and recurses into the
# s9pk.mk arch recipe, producing immich_<variant>_<arch>.s9pk.
generic-%:; VARIANT=generic $(MAKE) $*
cuda-%:; VARIANT=cuda $(MAKE) $*
rocm-%:; VARIANT=rocm $(MAKE) $*
openvino-%:; VARIANT=openvino $(MAKE) $*
