package com.medtrading.backend.controller;

import com.medtrading.backend.dto.PairDTO;
import com.medtrading.backend.entity.Pair;
import com.medtrading.backend.exception.ApiException;
import com.medtrading.backend.repository.PairRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pairs")
public class PairController {

    private final PairRepository pairRepository;

    public PairController(PairRepository pairRepository){
        this.pairRepository= pairRepository;
    }

    @GetMapping
    public List<PairDTO.PairResponse> getAllPaires(){
        return pairRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public PairDTO.PairResponse getPairById(@PathVariable Long id) {
        Pair pair =  pairRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pair introuvable avec l'id " + id));

        return toResponse(pair);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PairDTO.PairResponse createPair(@Valid @RequestBody PairDTO.CreatePairRequest request){
        if (pairRepository.existsBySymbol(request.symbol())) {
            throw new ApiException(HttpStatus.CONFLICT, "La paire " + request.symbol() + " existe deja");
        }
       Pair pair = new Pair();
       pair.setSymbol(request.symbol());
       pair.setName(request.name());
       pair.setQuoteCurrency(request.quoteCurrency());
       pair.setBaseCurrency(request.baseCurrency());

       Pair saved = pairRepository.save(pair);
       return toResponse(saved);

    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public PairDTO.PairResponse updatePair(@PathVariable Long id, @Valid @RequestBody PairDTO.CreatePairRequest request){
        Pair pair = pairRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pair introuvable avec l'id " + id));

        pair.setSymbol(request.symbol());
        pair.setName(request.name());
        pair.setBaseCurrency(request.baseCurrency());
        pair.setQuoteCurrency(request.quoteCurrency());

        Pair saved =  pairRepository.save(pair);

        return toResponse(saved);

    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePair(@PathVariable Long id){
        Pair pair = pairRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pair introuvable avec l'id " + id));

        pairRepository.delete(pair);
    }

    private PairDTO.PairResponse toResponse(Pair pair) {
        return new PairDTO.PairResponse(
                pair.getId(),
                pair.getSymbol(),
                pair.getName(),
                pair.getBaseCurrency(),
                pair.getQuoteCurrency()
        );
    }

}
