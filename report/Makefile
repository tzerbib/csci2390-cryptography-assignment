.SUFFIXES:	.pdf .md

IMGPATH=img

IMG = \


.PHONY: clean mrproper

assignment.pdf: assignment.md $(IMG)
	pandoc --listing --resource-path=img $*.md -f markdown -o $*.pdf

clean:
	rm -fv *.aux *.bbl *.blg *.log *.out *.toc

mrproper: clean
	rm -fv *.pdf
