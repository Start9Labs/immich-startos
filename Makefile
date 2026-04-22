# overrides to s9pk.mk must precede the include statement
TARGETS := generic cuda rocm openvino
ARCHES := x86 arm

include s9pk.mk

.PHONY += generic cuda rocm openvino

generic:
	VARIANT=generic $(MAKE) arches

cuda:
	VARIANT=cuda $(MAKE) arches ARCHES=x86

rocm:
	VARIANT=rocm $(MAKE) arches ARCHES=x86

openvino:
	VARIANT=openvino $(MAKE) arches ARCHES=x86
